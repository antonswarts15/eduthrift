#!/bin/sh
# Create upload directories at runtime so they persist on the mounted volume
mkdir -p /app/uploads/items \
         /app/uploads/id-documents \
         /app/uploads/proof-of-residence

exec java -jar /app/app.jar
