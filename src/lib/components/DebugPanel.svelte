<script lang="ts">
	import { presentationStore } from '$lib/stores/presentation.svelte';

	interface Props {
		isVisible: boolean;
	}

	let { isVisible }: Props = $props();

	// Get debug logs from store
	const debugLogs = $derived(presentationStore.debugLogs);
</script>

{#if isVisible}
	<div class="fixed top-0 right-0 h-screen w-1/3 bg-slate-900/95 backdrop-blur border-l border-slate-700 z-50 flex flex-col overflow-hidden">
		<!-- Header -->
		<div class="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
				<h2 class="text-lg font-bold text-white">🔍 Debug Panel</h2>
			</div>
			<div class="text-xs text-gray-400">
				Press <kbd class="bg-slate-700 px-2 py-1 rounded">D</kbd> to toggle
			</div>
		</div>

		<!-- Log entries -->
		<div class="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
			{#if debugLogs.length === 0}
				<div class="text-center text-gray-500 mt-8">
					<div class="text-4xl mb-2">📋</div>
					<div>No debug logs yet</div>
					<div class="text-xs mt-1">Make a request to see the agent flow</div>
				</div>
			{:else}
				{#each debugLogs as log, index (log.id)}
					<div class="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors">
						<!-- Timestamp and type -->
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center gap-2">
								{#if log.type === 'user_message'}
									<span class="text-blue-400">💬</span>
									<span class="font-bold text-blue-400">User Message</span>
								{:else if log.type === 'tool_call'}
									<span class="text-blue-400">🔧</span>
									<span class="font-bold text-blue-400">Tool Call</span>
								{:else if log.type === 'tool_result'}
									<span class="text-green-400">✅</span>
									<span class="font-bold text-green-400">Tool Result</span>
								{:else if log.type === 'llm_request'}
									<span class="text-yellow-400">🤖</span>
									<span class="font-bold text-yellow-400">LLM Request</span>
								{:else if log.type === 'llm_response'}
									<span class="text-cyan-400">💡</span>
									<span class="font-bold text-cyan-400">LLM Response</span>
								{:else if log.type === 'error'}
									<span class="text-red-400">❌</span>
									<span class="font-bold text-red-400">Error</span>
								{/if}
							</div>
							<span class="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
						</div>

						<!-- Log content -->
						<div class="text-gray-300">
							{#if log.type === 'user_message'}
								<div class="italic">"{log.data}"</div>
							{:else if log.type === 'tool_call'}
								<div class="space-y-1">
									<div><span class="text-blue-300">Tool:</span> {log.data.name}</div>
									<details class="mt-1">
										<summary class="cursor-pointer text-gray-400 hover:text-gray-300">Arguments</summary>
										<pre class="mt-1 p-2 bg-slate-900 rounded text-xs overflow-auto">{JSON.stringify(log.data.args, null, 2)}</pre>
									</details>
								</div>
							{:else if log.type === 'tool_result'}
								<div class="space-y-1">
									<div><span class="text-green-300">Tool:</span> {log.data.name}</div>
									<details class="mt-1">
										<summary class="cursor-pointer text-gray-400 hover:text-gray-300">Result ({log.data.result.length} chars)</summary>
										<pre class="mt-1 p-2 bg-slate-900 rounded text-xs overflow-auto max-h-40">{log.data.result}</pre>
									</details>
								</div>
							{:else if log.type === 'llm_request'}
								<div class="space-y-1">
									<div><span class="text-yellow-300">Model:</span> {log.data.model}</div>
									<div><span class="text-yellow-300">Messages:</span> {log.data.messageCount}</div>
									{#if log.data.hasTools}
										<div class="text-yellow-300">🔧 With {log.data.toolCount} tools</div>
									{/if}
								</div>
							{:else if log.type === 'llm_response'}
								<div class="space-y-1">
									{#if log.data.hasToolCalls}
										<div class="text-cyan-300">Requested {log.data.toolCallCount} tool(s)</div>
									{:else}
										<div class="text-cyan-300">Generated presentation JSON</div>
									{/if}
									<div class="text-gray-400 text-xs">{log.data.contentLength} chars</div>
								</div>
							{:else if log.type === 'error'}
								<div class="text-red-300">{log.data}</div>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Footer stats -->
		<div class="bg-slate-800 border-t border-slate-700 px-4 py-2 text-xs text-gray-400">
			<div class="flex items-center justify-between">
				<div>Total logs: {debugLogs.length}</div>
				<div>Tool calls: {debugLogs.filter(l => l.type === 'tool_call').length}</div>
			</div>
		</div>
	</div>
{/if}
