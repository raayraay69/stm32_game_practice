/**
 * @file   startup_stm32f0xx.S
 * @brief  STM32F0xx startup code in assembly
 */

  .syntax unified
  .cpu cortex-m0
  .fpu softvfp
  .thumb

.global g_pfnVectors
.global Default_Handler

/* Start address for the initialization values of the .data section */
.word _sidata
/* Start address for the .data section */
.word _sdata
/* End address for the .data section */
.word _edata
/* Start address for the .bss section */
.word _sbss
/* End address for the .bss section */
.word _ebss

/**
 * @brief  This is the code that gets called when the processor first
 *         starts execution following a reset event.
 */
.section .text.Reset_Handler
.weak Reset_Handler
.type Reset_Handler, %function
Reset_Handler:
  ldr   r0, =_estack
  mov   sp, r0          /* Set stack pointer */

/* Copy the data segment initializers from flash to SRAM */
  ldr   r0, =_sdata
  ldr   r1, =_edata
  ldr   r2, =_sidata
  movs  r3, #0
  b     LoopCopyDataInit

CopyDataInit:
  ldr   r4, [r2, r3]
  str   r4, [r0, r3]
  adds  r3, r3, #4

LoopCopyDataInit:
  adds  r4, r0, r3
  cmp   r4, r1
  bcc   CopyDataInit

/* Zero fill the bss segment */
  ldr   r2, =_sbss
  ldr   r4, =_ebss
  movs  r3, #0
  b     LoopFillZerobss

FillZerobss:
  str   r3, [r2]
  adds  r2, r2, #4

LoopFillZerobss:
  cmp   r2, r4
  bcc   FillZerobss

/* Call the clock system initialization function */
  bl    SystemInit

/* Call static constructors */
  bl    __libc_init_array

/* Call the application's entry point */
  bl    main

LoopForever:
  b     LoopForever

.size Reset_Handler, .-Reset_Handler

/**
 * @brief  This is the code that gets called when the processor receives an
 *         unexpected interrupt.
 */
.section .text.Default_Handler,"ax",%progbits
Default_Handler:
Infinite_Loop:
  b     Infinite_Loop
.size Default_Handler, .-Default_Handler

/* The default handler is used for all weak symbols */
.weak NMI_Handler
.thumb_set NMI_Handler,Default_Handler

.weak HardFault_Handler
.thumb_set HardFault_Handler,Default_Handler

.weak SVC_Handler
.thumb_set SVC_Handler,Default_Handler

.weak PendSV_Handler
.thumb_set PendSV_Handler,Default_Handler

.weak SysTick_Handler
.thumb_set SysTick_Handler,Default_Handler

.weak WWDG_IRQHandler
.thumb_set WWDG_IRQHandler,Default_Handler

.weak PVD_IRQHandler
.thumb_set PVD_IRQHandler,Default_Handler

.weak RTC_IRQHandler
.thumb_set RTC_IRQHandler,Default_Handler

.weak FLASH_IRQHandler
.thumb_set FLASH_IRQHandler,Default_Handler

.weak RCC_IRQHandler
.thumb_set RCC_IRQHandler,Default_Handler

.weak EXTI0_1_IRQHandler
.thumb_set EXTI0_1_IRQHandler,Default_Handler

.weak EXTI2_3_IRQHandler
.thumb_set EXTI2_3_IRQHandler,Default_Handler

.weak EXTI4_15_IRQHandler
.thumb_set EXTI4_15_IRQHandler,Default_Handler

.weak TS_IRQHandler
.thumb_set TS_IRQHandler,Default_Handler

.weak DMA1_Channel1_IRQHandler
.thumb_set DMA1_Channel1_IRQHandler,Default_Handler

.weak DMA1_Channel2_3_IRQHandler
.thumb_set DMA1_Channel2_3_IRQHandler,Default_Handler

.weak DMA1_Channel4_5_IRQHandler
.thumb_set DMA1_Channel4_5_IRQHandler,Default_Handler

.weak ADC1_IRQHandler
.thumb_set ADC1_IRQHandler,Default_Handler

.weak TIM1_BRK_UP_TRG_COM_IRQHandler
.thumb_set TIM1_BRK_UP_TRG_COM_IRQHandler,Default_Handler

.weak TIM1_CC_IRQHandler
.thumb_set TIM1_CC_IRQHandler,Default_Handler

.weak TIM2_IRQHandler
.thumb_set TIM2_IRQHandler,Default_Handler

.weak TIM3_IRQHandler
.thumb_set TIM3_IRQHandler,Default_Handler

.weak TIM6_DAC_IRQHandler
.thumb_set TIM6_DAC_IRQHandler,Default_Handler

.weak TIM7_IRQHandler
.thumb_set TIM7_IRQHandler,Default_Handler

.weak TIM14_IRQHandler
.thumb_set TIM14_IRQHandler,Default_Handler

.weak TIM15_IRQHandler
.thumb_set TIM15_IRQHandler,Default_Handler

.weak TIM16_IRQHandler
.thumb_set TIM16_IRQHandler,Default_Handler

.weak TIM17_IRQHandler
.thumb_set TIM17_IRQHandler,Default_Handler

.weak I2C1_IRQHandler
.thumb_set I2C1_IRQHandler,Default_Handler

.weak I2C2_IRQHandler
.thumb_set I2C2_IRQHandler,Default_Handler

.weak SPI1_IRQHandler
.thumb_set SPI1_IRQHandler,Default_Handler

.weak SPI2_IRQHandler
.thumb_set SPI2_IRQHandler,Default_Handler

.weak USART1_IRQHandler
.thumb_set USART1_IRQHandler,Default_Handler

.weak USART2_IRQHandler
.thumb_set USART2_IRQHandler,Default_Handler

/**
 * @brief  The Interrupt Vector Table
 */
.section .isr_vector,"a",%progbits
.type g_pfnVectors, %object
.size g_pfnVectors, .-g_pfnVectors

g_pfnVectors:
  .word _estack
  .word Reset_Handler
  .word NMI_Handler
  .word HardFault_Handler
  .word 0
  .word 0
  .word 0
  .word 0
  .word 0
  .word 0
  .word 0
  .word SVC_Handler
  .word 0
  .word 0
  .word PendSV_Handler
  .word SysTick_Handler
  
  /* External Interrupts */
  .word WWDG_IRQHandler                   /* Window WatchDog              */
  .word PVD_IRQHandler                    /* PVD through EXTI Line detection */
  .word RTC_IRQHandler                    /* RTC through the EXTI line     */
  .word FLASH_IRQHandler                  /* FLASH                        */
  .word RCC_IRQHandler                    /* RCC                          */
  .word EXTI0_1_IRQHandler                /* EXTI Line 0 and 1            */
  .word EXTI2_3_IRQHandler                /* EXTI Line 2 and 3            */
  .word EXTI4_15_IRQHandler               /* EXTI Line 4 to 15            */
  .word TS_IRQHandler                     /* Touch Sensing                */
  .word DMA1_Channel1_IRQHandler          /* DMA1 Channel 1               */
  .word DMA1_Channel2_3_IRQHandler        /* DMA1 Channel 2 and Channel 3 */
  .word DMA1_Channel4_5_IRQHandler        /* DMA1 Channel 4 and Channel 5 */
  .word ADC1_IRQHandler                   /* ADC1                         */
  .word TIM1_BRK_UP_TRG_COM_IRQHandler    /* TIM1 Break, Update, Trigger and Commutation */
  .word TIM1_CC_IRQHandler                /* TIM1 Capture Compare         */
  .word TIM2_IRQHandler                   /* TIM2                         */
  .word TIM3_IRQHandler                   /* TIM3                         */
  .word 0                                 /* Reserved                     */
  .word 0                                 /* Reserved                     */
  .word TIM6_DAC_IRQHandler               /* TIM6 and DAC                 */
  .word TIM7_IRQHandler                   /* TIM7                         */
  .word 0                                 /* Reserved                     */
  .word 0                                 /* Reserved                     */
  .word 0                                 /* Reserved                     */
  .word TIM14_IRQHandler                  /* TIM14                        */
  .word TIM15_IRQHandler                  /* TIM15                        */
  .word TIM16_IRQHandler                  /* TIM16                        */
  .word TIM17_IRQHandler                  /* TIM17                        */
  .word I2C1_IRQHandler                   /* I2C1                         */
  .word I2C2_IRQHandler                   /* I2C2                         */
  .word SPI1_IRQHandler                   /* SPI1                         */
  .word SPI2_IRQHandler                   /* SPI2                         */
  .word USART1_IRQHandler                 /* USART1                       */
  .word USART2_IRQHandler                 /* USART2                       */
  .word 0                                 /* Reserved                     */
  .word 0                                 /* Reserved                     */
  .word 0                                 /* Reserved                     */
  .word 0                                 /* Reserved                     */
  .word 0                                 /* Reserved                     */

.end
