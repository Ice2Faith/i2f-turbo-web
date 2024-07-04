nohup ./goboot.elf > goboot.log 2>&1 & echo $! > goboot.pid
PID=`cat goboot.pid`
echo start ok on $PID
