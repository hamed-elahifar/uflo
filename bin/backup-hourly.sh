#!/bin/bash
mongodump --db uflo --gzip --out /root/uflo-hourly/`date +'%Y-%m-%d--%H:%M'` > /dev/null 2>&1 &

#find /root/uflo-hourly/* -mtime +2 -exec rm -rf {} \; 