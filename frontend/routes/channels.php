<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('liveclass.{roomId}', function ($user, string $roomId) {
    return (bool) $user
        && in_array($roomId, request()->session()->get('liveclass.rooms', []), true);
});
