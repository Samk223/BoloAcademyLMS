<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveQuizResultsBroadcasted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $roomId,
        public string $quizId,
        public array $results
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('liveclass.'.$this->roomId)];
    }

    public function broadcastAs(): string
    {
        return 'live.quiz.results_broadcasted';
    }
}
