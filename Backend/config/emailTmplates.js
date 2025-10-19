export const EMAIL_VERIFY_TEMPLATE = ``

export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="und" style="width:100%;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
 <head><meta http-equiv="Content-Security-Policy" content="script-src 'unsafe-inline' https://scripts.claspo.io; connect-src 'none'; object-src 'none'; form-action 'none';">
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Trigger Newsletter 2</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG></o:AllowPNG>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <link rel="shortcut icon" type="image/png" href="https://stripo.email/assets/img/favicon.png">
  <style type="text/css">#outlook a {
	padding:0;
}
.ExternalClass {
	width:100%;
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
	line-height:100%;
}
.w {
	mso-style-priority:100!important;
	text-decoration:none!important;
}
a[x-apple-data-detectors] {
	color:inherit!important;
	text-decoration:none!important;
	font-size:inherit!important;
	font-family:inherit!important;
	font-weight:inherit!important;
	line-height:inherit!important;
}
.e {
	display:none;
	float:left;
	overflow:hidden;
	width:0;
	max-height:0;
	line-height:0;
	mso-hide:all;
}
.x:hover a.w {
	background:#ffffff!important;
	border-color:#ffffff!important;
}
.x:hover {
	background:#ffffff!important;
	border-style:solid solid solid solid!important;
	border-color:#3d5ca3 #3d5ca3 #3d5ca3 #3d5ca3!important;
}
@media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:20px!important; text-align:center; line-height:120%!important } h2 { font-size:16px!important; text-align:left; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { font-size:20px!important } h2 a { font-size:16px!important; text-align:left } h3 a { font-size:20px!important } .c td a { font-size:14px!important } .bd p, .bd ul li, .bd ol li, .bd a { font-size:10px!important } .bc p, .bc ul li, .bc ol li, .bc a { font-size:12px!important } .bb p, .bb ul li, .bb ol li, .bb a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .z, .z h1, .z h2, .z h3 { text-align:center!important }   .y img, .z img, .ba img { display:inline!important } .x { display:block!important } a.w { font-size:14px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important }  .r table, .s, .t, .u, .v { width:100%!important } .o table, .p table, .q table, .o, .q, .p { width:100%!important; max-width:600px!important }  .adapt-img { width:100%!important; height:auto!important }   .k { padding-left:0px!important }   .h { padding-bottom:20px!important }      .c td { width:1%!important } table.b, .esd-block-html table { width:auto!important } table.a { display:inline-block!important } table.a td { display:inline-block!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }</style>
 </head>
 <body style="width:100%;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
    <td esd-img-prev-src="https://fkus.stripocdn.email/content/guids/CABINET_8a8240f4650bd716d3cd69675fe184ca/images/1041555765740937.png" esd-img-prev-position="left top" esd-img-prev-repeat="no-repeat" bgcolor="transparent" align="left" class="esd-structure es-p40t es-p20r es-p20l" style="background-color:transparent;background-position:left top">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tbody>
      <tr>
        <td width="560" valign="top" align="center" class="esd-container-frame">
          <table esd-img-prev-src esd-img-prev-position="left top" width="100%" cellspacing="0" cellpadding="0" style="background-position:left top">
            <tbody>
              <tr>
                <td align="left" class="esd-block-text es-p15t es-p15b">
                  <h1 style="color:#333333;font-size:20px">
                    <strong>FORGOT YOUR PASSWORD?</strong>
                  </h1>
                </td>
              </tr>
              <tr>
                <td align="left" class="esd-block-text es-p40r es-p40l">
                  <p>
                    HI, {{email}}
                  </p>
                </td>
              </tr>
              <tr>
                <td align="left" class="esd-block-text es-p35r es-p40l">
                  <p>
                    There was a request to change your password!
                  </p>
                  <p>
                    <strong>Use the OTP to reset your the password</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" class="esd-block-button es-p40t es-p40b es-p10r es-p10l">
                  {{otp}}
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</td>
 </body>
</html>
`