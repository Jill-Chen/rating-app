#!/bin/sh
# 运行App
# runserver.sh pro run it in production config
if [$1 = 'pro' ]; then
    NODE_ENV=production node app.js
else
    node app.js
fi
exit 0
