<?php

namespace App\Services\Agora;

class RtcTokenBuilder
{
    public const ROLE_PUBLISHER = 1;
    public const ROLE_SUBSCRIBER = 2;

    private const VERSION = '007';
    private const SERVICE_RTC = 1;
    private const PRIVILEGE_JOIN_CHANNEL = 1;
    private const PRIVILEGE_PUBLISH_AUDIO_STREAM = 2;
    private const PRIVILEGE_PUBLISH_VIDEO_STREAM = 3;
    private const PRIVILEGE_PUBLISH_DATA_STREAM = 4;

    public static function buildTokenWithUserAccount(
        string $appId,
        string $appCertificate,
        string $channelName,
        string $account,
        int $role,
        int $tokenExpire,
        int $privilegeExpire
    ): string {
        $privileges = [
            self::PRIVILEGE_JOIN_CHANNEL => $privilegeExpire,
        ];

        if ($role === self::ROLE_PUBLISHER) {
            $privileges[self::PRIVILEGE_PUBLISH_AUDIO_STREAM] = $privilegeExpire;
            $privileges[self::PRIVILEGE_PUBLISH_VIDEO_STREAM] = $privilegeExpire;
            $privileges[self::PRIVILEGE_PUBLISH_DATA_STREAM] = $privilegeExpire;
        }

        return self::build($appId, $appCertificate, $tokenExpire, [
            self::SERVICE_RTC => self::packServiceRtc($channelName, $account, $privileges),
        ]);
    }

    private static function build(string $appId, string $appCertificate, int $expire, array $services): string
    {
        if (!self::isUuid($appId) || !self::isUuid($appCertificate)) {
            return '';
        }

        $issueTs = time();
        $salt = random_int(1, 99999999);

        ksort($services);

        $data = self::packString($appId)
            . self::packUint32($issueTs)
            . self::packUint32($expire)
            . self::packUint32($salt)
            . self::packUint16(count($services));

        foreach ($services as $service) {
            $data .= $service;
        }

        $signing = self::sign($appCertificate, $issueTs, $salt);
        $signature = hash_hmac('sha256', $data, $signing, true);

        return self::VERSION.base64_encode(zlib_encode(self::packString($signature).$data, ZLIB_ENCODING_DEFLATE));
    }

    private static function sign(string $appCertificate, int $issueTs, int $salt): string
    {
        $first = hash_hmac('sha256', $appCertificate, self::packUint32($issueTs), true);

        return hash_hmac('sha256', $first, self::packUint32($salt), true);
    }

    private static function packServiceRtc(string $channelName, string $account, array $privileges): string
    {
        return self::packUint16(self::SERVICE_RTC)
            . self::packMapUint32($privileges)
            . self::packString($channelName)
            . self::packString($account);
    }

    private static function packMapUint32(array $values): string
    {
        ksort($values);

        $packed = self::packUint16(count($values));
        foreach ($values as $key => $value) {
            $packed .= self::packUint16((int) $key).self::packUint32((int) $value);
        }

        return $packed;
    }

    private static function packString(string $value): string
    {
        return self::packUint16(strlen($value)).$value;
    }

    private static function packUint16(int $value): string
    {
        return pack('v', $value);
    }

    private static function packUint32(int $value): string
    {
        return pack('V', $value);
    }

    private static function isUuid(string $value): bool
    {
        return strlen($value) === 32 && ctype_xdigit($value);
    }
}
