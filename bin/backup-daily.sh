#!/bin/bash
mongodump --db tickado --gzip --out /root/tickado-daily/`date +'%Y-%m-%d'` > /dev/null 2>&1 &
find /root/tickado-daily/* -mtime +15 -exec rm -rf {} \;