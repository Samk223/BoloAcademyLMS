<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveQuizAnswerSubmitted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $roomId,
        public string $quizId,
        public string $studentName,
        public array $score
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('liveclass.'.$this->roomId)];
    }

    public function broadcastAs(): string
    {
        return 'live.quiz.answer_submitted';
    }
}
