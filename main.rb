if File.exist?("asymcrypt_data.yaml") || $d.tab == "access_control.cgi"


extDir = "../extensions/asymcrypt"

if File.exists?("#{extDir}/locale/#{GetText.locale.language}/dudle_asymcrypt.po")
	$d.html.add_html_head("<link rel='gettext' type='application/x-po' href='#{extDir}/locale/#{GetText.locale.language}/dudle_asymcrypt.po' />")
end

$d.html.add_head_script("#{extDir}/lib/Gettext.js")
$d.html.add_head_script("#{extDir}/lib/jquery.js")
$d.html.add_head_script("#{extDir}/lib/json2.js")
$d.html.add_head_script("#{extDir}/common.js")


$d.html.add_script(<<SCRIPT
var extDir = '#{extDir}';
var pollID = '#{$d.urlsuffix}';
SCRIPT
)

case $d.tab
  
when "access_control.cgi"
  $d.html.add_head_script("#{extDir}/access_control.js")
when "." 
  if $d.is_poll?
    $d.html.add_head_script("#{extDir}/participate.js")
  end
when "edit_columns.cgi"
  #$d.html.add_head_script("#{extDir}/edit_columns.js")
end


end
