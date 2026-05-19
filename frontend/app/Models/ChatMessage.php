<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = ['chat_room_id', 'sender_id', 'sender_type', 'message', 'attachment_path'];

    public function chatRoom()
    {
        return $this->belongsTo(ChatRoom::class);
    }
}
