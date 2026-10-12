<!--
  - Copyright (c) 2022-2026 NOISIF. All Rights Reserved.
  -
  - NOTICE: This source code is publicly available for reference
  - and educational purposes only. It is NOT open-source software.
  -
  - You are granted permission to view this code. However, you are strictly
  - PROHIBITED from copying, modifying, or merging this code into other software,
  - distributing, publishing, or sublicensing this code, using this code for
  - commercial purposes or in production environments.
  -
  - THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER
  - EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
  - MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
  -
  - Please refer to the LICENSE file in the root directory for full restrictions.
-->
<script lang="ts">
  import { Button } from 'bits-ui';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { cn } from '../util/cn';

  type Props = HTMLButtonAttributes & {
    children: Snippet;
  };

  let { children, ...rest }: Props = $props();

  function handleClick() {
    console.log('click');
  }
</script>

<Button.Root
  {...rest}
  class={cn(
    'rounded',
    'bg-black',
    'px-4',
    'py-2',
    'font-bold',
    'text-white',
    'transition',
    'hover:bg-brand-dark',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-brand-dark',
    'focus:ring-offset-2'
  )}
  onclick={handleClick}
>
  {@render children()}
</Button.Root>
