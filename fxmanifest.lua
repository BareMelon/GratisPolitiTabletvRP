fx_version 'cerulean'
games { 'gta5' }

author 'Premium MDT'
description 'Premium Danish Police MDT — Rigspolitiets Database'
version '2.0.0'

ui_page 'html/index.html'

shared_script 'config.lua'

client_scripts {
    '@vrp/client/Proxy.lua',
    '@vrp/client/Tunnel.lua',
    'client/main.lua'
}

server_scripts {
    '@vrp/lib/utils.lua',
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/install.lua',
    'server/services/core.js'
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'server/services/*'
}
