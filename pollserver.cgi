#!/usr/bin/env ruby

require "rubygems"
require "cgi"
require "yaml"
require "json"
Dir.chdir("../../")
require "git"
$c = CGI.new

if $c.include?("pollID") && File.directory?("./#{$c["pollID"]}/")
  Dir.chdir("./#{$c["pollID"]}")
end

$header = {"type" => "text/plain",
  "status" => "200 OK"}

$data

def openDB
  if File.exists?("asymcrypt_data.yaml") && !File.stat("asymcrypt_data.yaml").directory?
    File.open("asymcrypt_data.yaml"){|f|
      $data = YAML.load(f)}
  else
    $data = {"db" => {"votes" => {}, "keyId" => {}, "key" => {},
        "update_dates" => {}}}
    File.open("asymcrypt_data.yaml", "w") {| f |
      f << $data.to_yaml
    }
    VCS.add("asymcrypt_data.yaml")
    VCS.commit("public key Database initialized.")
  end
end

def storeDB
  File.open("asymcrypt_data.yaml", "w") {| f |
    f << $data.to_yaml
  }
end
openDB()

$body = ""

if ($c["service"])
  $service = $c["service"]
  #hier werden die einzelnen webservices definiert
  if ($service == "getDB") 
    $body += $data["db"].to_json
  end
  if ($service == "storeDB")
    #$data["db"] = JSON.parse($c["db"])
    #$data["db"] = $c["db"]
    storeDB()
    $body += $data["db"].inspect
  end
  if ($service == "storeRow")
    $data["db"]["votes"][$c["rowname"]]	= $c["row"]
    $data["db"]["update_dates"][$c["rowname"]] = DateTime::now()
    storeDB()
    openDB()
  end
  if ($service == "storeKeyId")
    $data["db"]["keyId"] = $c["row"]
    $data["db"]["update_dates"][$c["rowname"]] = DateTime::now()
    storeDB()
    openDB()
  end
  if ($service == "storeKey")
    $data["db"]["key"] = $c["row"]
    $data["db"]["update_dates"][$c["rowname"]] = DateTime::now()
    storeDB()
    openDB()
  end
end

$c.out($header) {$body}
