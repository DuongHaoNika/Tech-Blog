---
title: "Report bug subdomain live-api.hocmai.vn"
date: "2025-01-01"
excerpt: "By Duong Quang Hao, Dinh Thai Son"
featured: "/images/hocmai.png"
---


## Báo cáo lỗ hổng bảo mật: Rò rỉ cơ sở dữ liệu ##
__Người phát hiện:__ Dương Quang Hào, Đinh Thái Sơn 

__Ngày phát hiện:__ 12/11/2024

### 1.Tóm tắt 
Trong quá trình kiểm thử bảo mật, tôi đã phát hiện một số các subdomain của hocmai.vn. Trong  đó có subdomain: live-api.hocmai.vn. Trang web này có bật chế độ PHP Debugbar, có chứa  version, các log bao gồm URL, địa chỉ IP, thời gian,.. 

![image](https://github.com/user-attachments/assets/f62c35bd-a6f8-40d5-bb77-de75f9835ad4)


### 2.Mức độ nghiêm trọng: Cao 
- Tác động: Truy cập trái phép vào cơ sở dữ liệu và có khả năng đọc/ghi dữ liệu. 
- Khả năng khai thác: Dễ dàng khai thác bởi các hacker chỉ cần sử dụng các công cụ tự động  hoặc các lệnh cơ bản. 

### 3.Mô tả chi tiết lỗ hổng 
Lỗ hổng bắt nguồn từ chế độ debug, từ các log trên, tôi truy cập URL https://live api.hocmai.vn/api_hocmai/app/rate/current_rate mới method GET.

![image](https://github.com/user-attachments/assets/a9f85cd7-4e64-4753-bbc8-a9f8d8e92163)


Khi cuộn chuột xuống dưới sẽ thấy các thông tin env như sau:

![image](https://github.com/user-attachments/assets/88ab5ab7-6815-4bc6-b3e0-0bdca01a5876)

![image](https://github.com/user-attachments/assets/b03cf435-6e5e-4e87-8e56-791d1c6c5604)


![image](https://github.com/user-attachments/assets/5926e70d-ab5e-4723-aeb7-22c189e11f0f)



Tiến hành fuzz trang https://live-api.hocmai.vn tìm thấy được path /pma (Tương ứng  PhpMyAdmin) 

![image](https://github.com/user-attachments/assets/4e73259b-0451-4f1c-bbe7-2afda6c814a6)


Sau đó sử dụng cred vào trang web này để đăng nhập, vì tài khoản này là user không có quyền  root nên không thể leo quyền tuy nhiên vẫn có thể ảnh hưởng đến Database bằng việc thêm xóa  sửa (ảnh hưởng nghiêm trọng hệ thống)  

![image](https://github.com/user-attachments/assets/da3d8914-d0c0-4ce5-8a87-8ae925a21353)


Dưới đây là 2 file SQL đã được leak về (Sẽ được xóa sau khi mail này được xác nhận từ phía  hocmai.vn đồng thời được vá)

![image](https://github.com/user-attachments/assets/7e8dd183-5ef7-4190-be07-041d587c6f0d)

![image](https://github.com/user-attachments/assets/ffc5b3a4-135d-4d70-878b-c88736da8004)


Trong report này sẽ chỉ cập nhật về việc leak Database thông qua Debug mode của Laravel, tuy nhiên còn xuất hiện 1 số nguy cơ RCE vào hệ thống để chiếm quyền kiểm soát và có nguy cơ lộ lọt cookie của Admin dẫn đến có thể truy cập được vào /admin/dashboard. 
Cảm ơn quản trị viên đã đọc report này, nếu có thắc mắc gì vui lòng liên hệ qua email!