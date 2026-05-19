@props([
    'paginator',
])

@if($paginator->hasPages())
    <div class="mt-5 flex flex-col gap-3 border-t-[3px] border-dashed border-[#1E1E1E]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm font-bold text-[#1E1E1E]/60">
            Showing {{ $paginator->firstItem() }}-{{ $paginator->lastItem() }} of {{ $paginator->total() }}
        </p>
        <div class="flex items-center gap-3">
            @if($paginator->onFirstPage())
                <span class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] opacity-50">Previous</span>
            @else
                <a href="{{ $paginator->previousPageUrl() }}" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none">Previous</a>
            @endif

            <span class="rounded-full border-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                Page {{ $paginator->currentPage() }}
            </span>

            @if($paginator->hasMorePages())
                <a href="{{ $paginator->nextPageUrl() }}" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none">Next</a>
            @else
                <span class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] opacity-50">Next</span>
            @endif
        </div>
    </div>
@endif
