/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
const fs = require("fs");
const os = require("os");
const util = require("./common");
const unknown = 'unknown';
/**
 * There is no standard way on Linux to find the distribution name and version.
 * Recently, systemd has pushed to standardize the os-release file. This has
 * seen adoption in "recent" versions of all major distributions.
 * https://www.freedesktop.org/software/systemd/man/os-release.html
 */
class LinuxDistribution {
    constructor(name, version, idLike) {
        this.name = name;
        this.version = version;
        this.idLike = idLike;
    }
    static GetCurrent() {
        // Try /etc/os-release and fallback to /usr/lib/os-release per the synopsis
        // at https://www.freedesktop.org/software/systemd/man/os-release.html.
        return LinuxDistribution.FromFilePath('/etc/os-release')
            .catch(() => LinuxDistribution.FromFilePath('/usr/lib/os-release'))
            .catch(() => Promise.resolve(new LinuxDistribution(unknown, unknown)));
    }
    toString() {
        return `name=${this.name}, version=${this.version}`;
    }
    static FromFilePath(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(LinuxDistribution.FromReleaseInfo(data));
                }
            });
        });
    }
    static FromReleaseInfo(releaseInfo, eol = os.EOL) {
        let name = unknown;
        let version = unknown;
        let idLike = null;
        const lines = releaseInfo.split(eol);
        for (let line of lines) {
            line = line.trim();
            let equalsIndex = line.indexOf('=');
            if (equalsIndex >= 0) {
                let key = line.substring(0, equalsIndex);
                let value = line.substring(equalsIndex + 1);
                // Strip double quotes if necessary
                if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                if (key === 'ID') {
                    name = value;
                }
                else if (key === 'VERSION_ID') {
                    version = value;
                }
                else if (key === 'ID_LIKE') {
                    idLike = value.split(" ");
                }
                if (name !== unknown && version !== unknown && idLike !== null) {
                    break;
                }
            }
        }
        return new LinuxDistribution(name, version, idLike);
    }
}
exports.LinuxDistribution = LinuxDistribution;
class PlatformInformation {
    constructor(platform, architecture, distribution = null) {
        this.platform = platform;
        this.architecture = architecture;
        this.distribution = distribution;
        try {
            this.runtimeId = PlatformInformation.getRuntimeId(platform, architecture, distribution);
        }
        catch (err) {
            this.runtimeId = null;
        }
    }
    isWindows() {
        return this.platform === 'win32';
    }
    isMacOS() {
        return this.platform === 'darwin';
    }
    isLinux() {
        return this.platform === 'linux';
    }
    toString() {
        let result = this.platform;
        if (this.architecture) {
            if (result) {
                result += ', ';
            }
            result += this.architecture;
        }
        if (this.distribution) {
            if (result) {
                result += ', ';
            }
            result += this.distribution.toString();
        }
        return result;
    }
    static GetCurrent() {
        let platform = os.platform();
        let architecturePromise;
        let distributionPromise;
        switch (platform) {
            case 'win32':
                architecturePromise = PlatformInformation.GetWindowsArchitecture();
                distributionPromise = Promise.resolve(null);
                break;
            case 'darwin':
                architecturePromise = PlatformInformation.GetUnixArchitecture();
                distributionPromise = Promise.resolve(null);
                break;
            case 'linux':
                architecturePromise = PlatformInformation.GetUnixArchitecture();
                distributionPromise = LinuxDistribution.GetCurrent();
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
        return Promise.all([architecturePromise, distributionPromise])
            .then(([arch, distro]) => {
            return new PlatformInformation(platform, arch, distro);
        });
    }
    static GetWindowsArchitecture() {
        return new Promise((resolve, reject) => {
            if (process.env.PROCESSOR_ARCHITECTURE === 'x86' && process.env.PROCESSOR_ARCHITEW6432 === undefined) {
                resolve('x86');
            }
            else {
                resolve('x86_64');
            }
        });
    }
    static GetUnixArchitecture() {
        return util.execChildProcess('uname -m')
            .then(architecture => {
            if (architecture) {
                return architecture.trim();
            }
            return null;
        });
    }
    /**
     * Returns a supported .NET Core Runtime ID (RID) for the current platform. The list of Runtime IDs
     * is available at https://github.com/dotnet/corefx/tree/master/pkg/Microsoft.NETCore.Platforms.
     */
    static getRuntimeId(platform, architecture, distribution) {
        // Note: We could do much better here. Currently, we only return a limited number of RIDs that
        // are officially supported.
        switch (platform) {
            case 'win32':
                switch (architecture) {
                    case 'x86': return 'win7-x86';
                    case 'x86_64': return 'win7-x64';
                }
                throw new Error(`Unsupported Windows architecture: ${architecture}`);
            case 'darwin':
                if (architecture === 'x86_64') {
                    // Note: We return the El Capitan RID for Sierra
                    return 'osx.10.11-x64';
                }
                throw new Error(`Unsupported macOS architecture: ${architecture}`);
            case 'linux':
                if (architecture === 'x86_64') {
                    const unknown_distribution = 'unknown_distribution';
                    const unknown_version = 'unknown_version';
                    // First try the distribution name
                    let runtimeId = PlatformInformation.getRuntimeIdHelper(distribution.name, distribution.version);
                    // If the distribution isn't one that we understand, but the 'ID_LIKE' field has something that we understand, use that
                    //
                    // NOTE: 'ID_LIKE' doesn't specify the version of the 'like' OS. So we will use the 'VERSION_ID' value. This will restrict
                    // how useful ID_LIKE will be since it requires the version numbers to match up, but it is the best we can do.
                    if (runtimeId === unknown_distribution && distribution.idLike && distribution.idLike.length > 0) {
                        for (let id of distribution.idLike) {
                            runtimeId = PlatformInformation.getRuntimeIdHelper(id, distribution.version);
                            if (runtimeId !== unknown_distribution) {
                                break;
                            }
                        }
                    }
                    if (runtimeId !== unknown_distribution && runtimeId !== unknown_version) {
                        return runtimeId;
                    }
                }
                // If we got here, this is not a Linux distro or architecture that we currently support.
                throw new Error(`Unsupported Linux distro: ${distribution.name}, ${distribution.version}, ${architecture}`);
        }
        // If we got here, we've ended up with a platform we don't support  like 'freebsd' or 'sunos'.
        // Chances are, VS Code doesn't support these platforms either.
        throw Error('Unsupported platform ' + platform);
    }
    static getRuntimeIdHelper(distributionName, distributionVersion) {
        const unknown_distribution = 'unknown_distribution';
        const unknown_version = 'unknown_version';
        const centos_7 = 'centos.7-x64';
        const debian_8 = 'debian.8-x64';
        const fedora_23 = 'fedora.23-x64';
        const fedora_24 = 'fedora.24-x64';
        const opensuse_13_2 = 'opensuse.13.2-x64';
        const opensuse_42_1 = 'opensuse.42.1-x64';
        const rhel_7 = 'rhel.7-x64';
        const ubuntu_14_04 = 'ubuntu.14.04-x64';
        const ubuntu_16_04 = 'ubuntu.16.04-x64';
        const ubuntu_16_10 = 'ubuntu.16.10-x64';
        switch (distributionName) {
            case 'Zorin OS':
                if (distributionVersion === "12") {
                    return ubuntu_16_04;
                }
                break;
            case 'ubuntu':
                if (distributionVersion === "14.04") {
                    // This also works for Linux Mint
                    return ubuntu_14_04;
                }
                else if (distributionVersion === "16.04") {
                    return ubuntu_16_04;
                }
                else if (distributionVersion === "16.10") {
                    return ubuntu_16_10;
                }
                break;
            case 'elementary':
            case 'elementary OS':
                if (distributionVersion.startsWith("0.3")) {
                    // Elementary OS 0.3 Freya is binary compatible with Ubuntu 14.04
                    return ubuntu_14_04;
                }
                else if (distributionVersion.startsWith("0.4")) {
                    // Elementary OS 0.4 Loki is binary compatible with Ubuntu 16.04
                    return ubuntu_16_04;
                }
                break;
            case 'linuxmint':
                if (distributionVersion.startsWith("18")) {
                    // Linux Mint 18 is binary compatible with Ubuntu 16.04
                    return ubuntu_16_04;
                }
                break;
            case 'centos':
            case 'ol':
                // Oracle Linux is binary compatible with CentOS
                return centos_7;
            case 'fedora':
                if (distributionVersion === "23") {
                    return fedora_23;
                }
                else if (distributionVersion === "24") {
                    return fedora_24;
                }
                break;
            case 'opensuse':
                if (distributionVersion.startsWith("13.")) {
                    return opensuse_13_2;
                }
                else if (distributionVersion.startsWith("42.")) {
                    return opensuse_42_1;
                }
                break;
            case 'rhel':
                return rhel_7;
            case 'debian':
                return debian_8;
            case 'galliumos':
                if (distributionVersion.startsWith("2.0")) {
                    return ubuntu_16_04;
                }
                break;
            case 'arch':
                // NOTE: currently Arch Linux seems to be compatible enough with Ubuntu 16 that this works,
                // though in the future this may need to change as Arch follows a rolling release model.
                return ubuntu_16_04;
            default:
                return unknown_distribution;
        }
        return unknown_version;
    }
}
exports.PlatformInformation = PlatformInformation;
//# sourceMappingURL=platform.js.map