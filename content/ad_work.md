# Kerberos - Cách Kerberos hoạt động?

## Kerberos là gì?

Đầu tiên, Kerberos là một giao thức xác thực, không phải để phân quyền. Nói cách khác, nó cho phép xác thực người dùng, người cùng cấp mật khẩu bí mật, tuy nhiên, Kerberos không xác thực rằng người dùng này có thể truy cập vào tài nguyên hay service nào.

Kerberos được sử dụng trong Active Directory. Trong AD, Kerberos cung cấp thông tin về đặc quyền của mỗi người dùng, nhưng mỗi service có trách nhiệm xác định xem người dùng có quyền truy cập vào tài nguyên của mình hay không.

## Kerberos items

### Transport layer

Kerberos sử dụng TCP hoặc UDP cho transport protocol - gửi dữ liệu dưới dạng clear text. Do đó Kerberos chịu trách nhiệm cung cấp mã hóa.

Ports được Kerberos sử dụng là UDP/88 và TCP/88. 

### Agents

Một số agents làm việc với nhau cung cấp việc xác thực trong Kerberos.
- Client hoặc user người mà muốn truy cập đến service.
- AP (Application Server) đề nghị service bắt buộc cho user.
- KDC (Key Distribution Center), là service chính của Kerberos, có trách nhiệm phát các vé (ticket), được cài đặt sẵn trên DC (Domain Controller). Nó được hỗ trợ bởi AS (Authenticate Service) - phát hành TGT (Ticket-Granting Ticket).

### Encryption keys

Có 1 số cấu trúc được xử lý bởi Kerberos, ví dụ như ticket. Nhiều kiểu cấu trúc được mã hóa hay được ký (sign) để tránh bị bên thứ ba can thiệp.
Các key như:

- KDC hay krbtgt key được lấy từ bản băm NTLM  của krbtgt account.
- User key được lấy từ bản băm NTLM từ người dùng.
- Service key được lấy từ bản băm NTML của service owner, có thể là user/computer account. 
- Session key được trao đổi giữa người dùng và KDC.
- Service session key được dùng giữa người dùng và service.

### Tickets

Cấu trúc chính được xử lý bởi Kerberos là tickets. Tickets được vẫn chuyển tới người dùng, được người dùng sử dụng để thực hiện một số hành động trong Kerberos realm. Có 2 loại tickets:

- TGS (Ticket Granting Service) là vé được người dùng sử dụng để xác thực với 1 service và được mã hóa bởi service key.
- TGT (Ticket Granting Ticket) là vé đại diện cho KDC để yêu cầu TGS. Vé này được mã hóa bằng khóa TGS, nên chỉ có TGS có thể giải mã và sử dụng nó. TGT được sử dụng với lần đầu tiên đăng nhập của người dùng. 

__Mối quan hệ giữa TGT và TGS__

- TGT đóng vai trò như một vé trung gian để người dùng có thể lấy thêm Service Ticket từ TGS mà không cần xác thực lại với Authentication Server mỗi lần.
- TGS là máy chủ quản lý và cấp phát Service Ticket dựa trên TGT mà người dùng cung cấp.

### PAC

PAC (Privilege Attribute Certificate) là 1 cấu trúc trong hầu hết các vé. Cấu trúc này bao gồm đặc quyền của người dùng và được ký với KDC key.

Service có thể xác minh PAC bằng cách giao tiếp với KDC (không xảy ra thường xuyên). Tuy nhiên, xác minh PAC chỉ bao gồm việc kiểm tra chữ ký của nó, mà không kiểm tra xem các đặc quyền bên trong PAC có đúng không.

Hơn nữa, máy khách có thể tránh việc đưa PAC vào bên trong vé bằng cách chỉ định nó trong trường KERB-PA-PAC-REQUEST của yêu cầu vé.

### Messages

Kerberos có 1 số kiểu messages:

- KRB_AS_REQ: Yêu cầu TGT tới KDC.
- KRB_AS_REP: Vận chuyển TGT bởi KDC.
- KRB_TGS_REQ: Yêu cầu TGS tới KDC, sử dụng TGT.
- KRB_TGS_REP: Vận chuyển TGS bởi KDC.
- KRB_AP_REQ: Xác thực người dùng với service, sử dụng TGS.
- KRB_AP_REP: Được service sử dụng để xác định danh tính của chính nó so với người dùng.
- KRB_ERROR: Message giao tiếp điều kiện lỗi.

![image](https://hackmd.io/_uploads/rJlRTE1z1x.png)


## Authentication process

### KRB_AS_REQ

Đầu tiên, người dùng sẽ lấy TGT từ KDC bằng cách gửi KRB_AS_REQ:

![image](https://hackmd.io/_uploads/ByQ3ySJzkl.png)


Các thành phần của KRB_AS_REQ: 

- Timestamp được mã hóa bởi key của người dùng để xác thực người dùng và ngăn chặn các cuộc tấn công phát lại.
- Username của người dùng.
- Dịch vụ SPN cùng với ktgrbt account.
- Nonce được tạo bởi người dùng.

Note: encrypted timestamp chỉ cần thiết nếu người dùng yêu cầu preauthentication, ngoại trừ trường hợp flag DONT_REQ_PREAUTH được đặt trong tài khoản người dùng.

### KRB_AS_REP

Sau khi nhận được request, KDC xác minh danh tính người dùng bằng cách giải mã timestamp. Nếu đúng, KDC trả về KRB_AS_REP.

![image](https://hackmd.io/_uploads/HyozBBJfJx.png)

KRB_AS_REP bao gồm các thông tin:

- Username
- TGS, bao gồm: Service session key, username, TGS expiration time, PAC với đặc quyền của người dùng, được ký bởi KDC.
- Dữ liệu mã hóa với session key: Service session key, TGS expiration time, User nonce: ngăn chặn replay attacks

### KRB_AP_REQ

Nếu mọi thứ đều ổn, người dùng có 1 TGS hợp lệ để tương tác với service. Để sử dụng nó, người dùng phải gửi đến AP một KRB_AP_REQ message.

![image](https://hackmd.io/_uploads/B1M5vBJMke.png)


KRB_AP_REQ bao gồm:

- TGS
- Dữ liệu mã hóa với service session key.

Sau đó, nếu đặc quyền người dùng đúng, có thể truy cập vào service. 

## Attacks

### Overpass The Hash/Pass The Key (PTK)

Cuộc tấn công Pass The Hash (PTH) phổ biến bao gồm việc sử dụng user hash để mạo danh người dùng cụ thể. 

Nếu kẻ tấn công lấy được hash user của ai thì có thể mạo danh người đó + truy cập các services.

User hash có thể lấy được từ SAM files trong Workstation hay file NTDS.DIT trên DCs, hoặc cũng có thể từ lsass process memory (sử dụng Mimikatz) => có thể tìm thấy mật khẩu dạng cleartext.

### Pass The Ticket (PTT)

Là kĩ thuật lấy ticket của người dùng và mạo danh được người đó. Ngoài ticket, ta cũng cần phải có session key để sử dụng ticket.

Có thế lấy được ticket qua Man-In-The-Middle attack, vì Kerberos gửi qua TCP/UDP => chỉ lấy được ticket chứ session key thì không.

=> Lấy ticket và session key thông qua lsass process memory => dùng https://github.com/gentilkiwi/mimikatz

=> Nên lấy TGT thay vì TGS, vì TGS chỉ có thể dùng cho 1 service, TGT chỉ có hiệu lực trong vòng 10 giờ.

### Golden Ticket and Silver Ticket

Mục tiêu của Golden Ticket là xây dựng 1 TGT. Ta cần có bản băm của NTLM của tài khoản krbtgt. Sau khi có, có thể xây dựng một TGT với người dùng và đặc quyền tùy chỉnh.

Khi người dùng thay đổi mật khẩu, ticket vẫn hợp lệ. TGT chỉ không hợp lệ khi hết hạn hay tài khoản krbtgt thay đổi mật khẩu. 

Silver Ticket tương tự, nhưng xây dựng TGS. Trong trường hợp này, cần có khóa dịch vụ, được lấy từ tài khoản chủ sở hữu dịch vụ. Tuy nhiên, không thể ký đúng PAC nếu không có khóa krbtgt. Do đó, nếu dịch vụ xác minh PAC, thì kỹ thuật này sẽ không hoạt động.

### Kerberoasting

Là kĩ thuật tận dụng lợi thế của TGS để crack user's password offline. 

Như trước đó, TGS được mã hóa với service key, được lấy từ bản băm người chủ tài khoản NTLM. Thông thường, chủ sở hữu của các dịch vụ là máy tính mà các dịch vụ đang được thực thi. Tuy nhiên, mật khẩu máy tính rất phức tạp, do đó, không hữu ích khi cố gắng bẻ khóa chúng. Điều này cũng xảy ra trong trường hợp tài khoản krbtgt, do đó, TGT cũng không thể bẻ khóa được.

Trong 1 số trường hợp thì chủ sở hữu tài khoản là người bình thường => khả thi để bẻ khóa hơn, có đặc quyền hấp dẫn. Ngoài ra, để có được TGS cho bất kỳ dịch vụ nào, chỉ cần một tài khoản miền bình thường, do Kerberos không thực hiện kiểm tra ủy quyền.


### ASREPRoast

Giống với Kerberoasting, crack mật khẩu.

Nếu thuộc tính DONT_REQ_PREAUTH được set cho tài khoản người dùng, khi đó có thể xây dựng KRB_AS_REQ message mà không cần mật khẩu.

Sau đó, KDC sẽ phản hồi lại KRB_AS_REP message, bao gồm các thông tin được mã hóa với user key.


## Tài liệu tham khảo:

- https://www.tarlogic.com/blog/how-kerberos-works


