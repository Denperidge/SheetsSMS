
To connect a device over wifi, first use adb connect, then cordova run android --device 
Oh and use adb kill-server if you're only running one emulator/device but adb detects multiple for your logcat and stuff

## License

Some parts of this work incorporate code from the Apache Software Foundation, licensed under apache-2.0. More information on this can be found in [NOTICE](notice.md). Everything written by myself or any contributors (unless explicitly stated otherwise) is licensed under the [MIT license](LICENSE).