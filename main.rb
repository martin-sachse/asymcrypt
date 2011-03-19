############################################################################
# Copyright 2011 Benjamin Kellermann, Martin Sachse, Oliver Hoehne, 	     #
# Robert Bachran         				  		                                     #
#                                                                          #
# This file is part of dudle.                                              #
#                                                                          #
# Dudle is free software: you can redistribute it and/or modify it under   #
# the terms of the GNU Affero General Public License as published by       #
# the Free Software Foundation, either version 3 of the License, or        #
# (at your option) any later version.                                      #
#                                                                          #
# Dudle is distributed in the hope that it will be useful, but WITHOUT ANY #
# WARRANTY; without even the implied warranty of MERCHANTABILITY or        #
# FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public     #
# License for more details.                                                #
#                                                                          #
# You should have received a copy of the GNU Affero General Public License #
# along with dudle.  If not, see <http://www.gnu.org/licenses/>.           #
############################################################################


if File.exist?("asymcrypt_data.yaml") || $d.tab == "access_control.cgi"


extDir = "../extensions/asymcrypt"

if File.exists?("#{extDir}/locale/#{GetText.locale.language}/dudle_asymcrypt.po")
	$d.html.add_html_head("<link rel='gettext' type='application/x-po' href='#{extDir}/locale/#{GetText.locale.language}/dudle_asymcrypt.po' />")
end

$d.html.add_head_script("#{extDir}/lib/Gettext.js")
$d.html.add_head_script("#{extDir}/lib/jquery.js")
$d.html.add_head_script("#{extDir}/lib/json2.js")
$d.html.add_head_script("#{extDir}/common.js")
$d.html.add_head_script("#{extDir}/lib/pgp/aes-enc.js")
$d.html.add_head_script("#{extDir}/lib/pgp/base64.js")
$d.html.add_head_script("#{extDir}/lib/pgp/mouse.js")
$d.html.add_head_script("#{extDir}/lib/pgp/PGencode.js")
$d.html.add_head_script("#{extDir}/lib/pgp/PGpubkey.js")
$d.html.add_head_script("#{extDir}/lib/pgp/rsa.js")
$d.html.add_head_script("#{extDir}/lib/pgp/sha1.js")

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
end


end
