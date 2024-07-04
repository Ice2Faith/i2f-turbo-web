const Browser = {
    userAgent() {
        return navigator.userAgent
    },
    isContains(str, subArr) {
        if (!str) {
            return false
        }
        if (!subArr) {
            return false
        }
        if (!subArr.length || subArr.length == 0) {
            return false
        }
        for (let i = 0; i < subArr.length; i++) {
            if (!subArr[i]) {
                continue
            }
            if (str.indexOf(subArr[i]) >= 0) {
                return true
            }
        }
        return false
    },
    isWindows() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['windows']
        return this.isContains(ua, flags)
    },
    isLinux() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['linux']
        return this.isContains(ua, flags)
    },
    isAndroid() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['android']
        return this.isContains(ua, flags)
    },
    isIos() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['iphone', 'ipad', 'ipod']
        return this.isContains(ua, flags)
    },
    isWechat() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['micromessenger', 'wechat', 'weixin']
        return this.isContains(ua, flags)
    },
    is360() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['360']
        return this.isContains(ua, flags)
    },
    isFirefox() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['firefox']
        return this.isContains(ua, flags)
    },
    isMobile() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['mobile']
        return this.isContains(ua, flags)
    },
    isChrome() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['chrome']
        return this.isContains(ua, flags)
    },
    isSafari() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['safari']
        return this.isContains(ua, flags)
    },
    isEdge() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['edg', 'edge']
        return this.isContains(ua, flags)
    },
    isXiaomi() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['xiaomi', 'mibrowser', 'miuibrowser']
        return this.isContains(ua, flags)
    },
    isIE() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['msie', 'trident']
        return this.isContains(ua, flags)
    },
    isOpera() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['opera', 'presto']
        return this.isContains(ua, flags)
    },
    isHarmonyOS() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['harmony']
        return this.isContains(ua, flags)
    },
    isX86() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['x86', 'win32']
        return this.isContains(ua, flags)
    },
    isX64() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['x64', 'win64', 'wow64']
        return this.isContains(ua, flags)
    },
    isArm() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['arm']
        return this.isContains(ua, flags)
    },
    isArm64() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['arm64']
        return this.isContains(ua, flags)
    },
    isAppleWebkit() {
        let ua = this.userAgent().toLowerCase()
        let flags = ['applewebkit']
        return this.isContains(ua, flags)
    },
    windowsVersion() {
        let ua = this.userAgent()
        let str = ua.match(/windows[ a-z0-9._\-]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    androidVersion() {
        let ua = this.userAgent()
        let str = ua.match(/android[ a-z0-9._\-]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    ieVersion() {
        let ua = this.userAgent()
        let str = ua.match(/msie[ a-z0-9._\-]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    iosVersion() {
        let ua = this.userAgent()
        let str = ua.match(/iphone os[ a-z0-9._\-]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    mozillaVersion() {
        let ua = this.userAgent()
        let str = ua.match(/mozilla\/[0-9.]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    appleWebKitVersion() {
        let ua = this.userAgent()
        let str = ua.match(/applewebkit\/[0-9.]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    chromeVersion() {
        let ua = this.userAgent()
        let str = ua.match(/chrome\/[0-9.]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    safariVersion() {
        let ua = this.userAgent()
        let str = ua.match(/safari\/[0-9.]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    version() {
        let ua = this.userAgent()
        let str = ua.match(/version\/[0-9.]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    wechatVersion() {
        let ua = this.userAgent()
        let str = ua.match(/micromessenger\/[0-9.]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    edgeVersion() {
        let ua = this.userAgent()
        let str = ua.match(/edg\/[0-9.]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    miuiVersion() {
        let ua = this.userAgent()
        let str = ua.match(/miuibrowser\/[0-9.]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    firefoxVersion() {
        let ua = this.userAgent()
        let str = ua.match(/firefox\/[0-9.]+/i)
        if (str) {
            return str[0]
        }
        return ''
    },
    operaVersion() {
        let ua = this.userAgent()
        let str = ua.match(/opera( [a-z0-9]+)\/[0-9.]+/i)
        if (str) {
            return str[0]
        }
        return ''
    }
}

export default Browser
