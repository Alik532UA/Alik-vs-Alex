<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let status = $derived(page.status || 404);
	let is404 = $derived(status === 404);
</script>

<svelte:head>
	<title>{status} — {is404 ? 'Зона поза периметром' : 'Системний збій'} · Alik vs Alex</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="colony-error-screen">
	<div class="terminal-card">
		<div class="status-glitch">{status}</div>
		<h1 class="colony-title">
			{is404 ? 'СЕКТОР НЕ ЗНАЙДЕНО (OUT OF BOUNDS)' : 'КРИТИЧНИЙ ЗБІЙ КОЛОНІЇ'}
		</h1>
		<p class="colony-desc">
			{is404
				? 'Запитувані координати знаходяться за межами захищеного периметру колонії. Повертайтесь на базу.'
				: 'Стався збій у підсистемах колонії. Оборона тимчасово призупинена.'}
		</p>
		<div class="colony-actions">
			<a href={resolve('/')} class="base-btn">
				<span>ПОСЕРЕДНИЦТВО НА БАЗУ (HOME)</span>
			</a>
		</div>
	</div>
</div>

<style>
	.colony-error-screen {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		min-height: 100dvh;
		background: #090d16;
		color: #e2e8f0;
		font-family: 'Courier New', Courier, monospace;
		padding: 24px;
	}

	.terminal-card {
		background: rgba(15, 23, 42, 0.85);
		border: 1px solid #00f0ff;
		box-shadow: 0 0 30px rgba(0, 240, 255, 0.2);
		border-radius: 12px;
		padding: 40px 32px;
		max-width: 520px;
		width: 100%;
		text-align: center;
	}

	.status-glitch {
		font-size: 3.5rem;
		font-weight: 900;
		color: #ff0055;
		text-shadow: 0 0 12px rgba(255, 0, 85, 0.5);
		margin-bottom: 12px;
	}

	.colony-title {
		font-size: 1.25rem;
		color: #00f0ff;
		margin: 0 0 16px;
		letter-spacing: 0.1em;
	}

	.colony-desc {
		font-size: 0.95rem;
		line-height: 1.6;
		color: #94a3b8;
		margin: 0 0 28px;
	}

	.colony-actions {
		display: flex;
		justify-content: center;
	}

	.base-btn {
		display: inline-flex;
		align-items: center;
		background: #00f0ff;
		color: #090d16;
		font-weight: 800;
		padding: 12px 24px;
		border-radius: 6px;
		text-decoration: none;
		letter-spacing: 0.08em;
		transition: all 0.2s ease;
		box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
	}

	.base-btn:hover {
		background: #ffffff;
		transform: translateY(-2px);
		box-shadow: 0 0 25px rgba(0, 240, 255, 0.7);
	}
</style>
