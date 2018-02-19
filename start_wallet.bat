setlocal
start edollard.exe
start edollar-wallet-rpc.exe --rpc-bind-port 8888 --disable-rpc-login --wallet-dir wallets
start chrome --disable-web-security --user-data-dir="%cd%/_chrome_temp_data" file:///%cd%/index.html