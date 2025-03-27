/**
 * @file system_stm32f0xx.c
 * @brief CMSIS system initialization for STM32F0xx devices
 */

#include "stm32f0xx.h"

/* This variable is updated in three ways:
    1) by calling CMSIS function SystemCoreClockUpdate()
    2) by calling HAL API function HAL_RCC_GetHCLKFreq()
    3) each time HAL_RCC_ClockConfig() is called to configure the system clock frequency 
       Note: If you use this function to configure the system clock, then there
             is no need to call the 2 first functions listed above, since SystemCoreClock
             variable is updated automatically.
*/
uint32_t SystemCoreClock = 8000000;

/**
 * @brief Update SystemCoreClock variable according to Clock Register Values
 *
 * The SystemCoreClock variable contains the core clock (HCLK), it can
 * be used by the user application to setup the SysTick timer or configure
 * other parameters.
 */
void SystemCoreClockUpdate(void) {
    uint32_t tmp = 0;
    uint32_t pllmul = 0, pllsrc = 0;

    /* Get SYSCLK source */
    tmp = RCC->CFGR & RCC_CFGR_SWS;

    switch (tmp) {
        case RCC_CFGR_SWS_HSI:  /* HSI used as system clock */
            SystemCoreClock = HSI_VALUE;
            break;
        case RCC_CFGR_SWS_HSE:  /* HSE used as system clock */
            SystemCoreClock = HSE_VALUE;
            break;
        case RCC_CFGR_SWS_PLL:  /* PLL used as system clock */
            /* Get PLL clock source and multiplication factor */
            pllmul = RCC->CFGR & RCC_CFGR_PLLMUL;
            pllsrc = RCC->CFGR & RCC_CFGR_PLLSRC;
            pllmul = ( pllmul >> 18) + 2;

            if (pllsrc == RCC_CFGR_PLLSRC_HSI_DIV2) {
                /* HSI oscillator clock divided by 2 selected as PLL clock entry */
                SystemCoreClock = (HSI_VALUE >> 1) * pllmul;
            } else {
                /* HSE selected as PLL clock entry */
                SystemCoreClock = HSE_VALUE * pllmul;
            }
            break;
        case RCC_CFGR_SWS_HSI48: /* HSI48 used as system clock */
            SystemCoreClock = HSI48_VALUE;
            break;
        default: /* HSI used as system clock */
            SystemCoreClock = HSI_VALUE;
            break;
    }

    /* Compute HCLK clock frequency */
    /* Get HCLK prescaler */
    tmp = RCC->CFGR & RCC_CFGR_HPRE;
    tmp = tmp >> 4;
    
    /* HCLK clock frequency */
    SystemCoreClock = SystemCoreClock >> AHBPrescTable[tmp];
}

/**
 * @brief Setup the microcontroller system
 */
void SystemInit(void) {
    /* Reset the RCC clock configuration to the default reset state */
    /* Set HSION bit */
    RCC->CR |= (uint32_t)0x00000001;

    /* Reset SW, HPRE, PPRE and MCOSEL bits */
    RCC->CFGR &= (uint32_t)0xF8FFB80C;
  
    /* Reset HSEON, CSSON and PLLON bits */
    RCC->CR &= (uint32_t)0xFEF6FFFF;

    /* Reset HSEBYP bit */
    RCC->CR &= (uint32_t)0xFFFBFFFF;

    /* Reset PLLSRC, PLLXTPRE and PLLMUL bits */
    RCC->CFGR &= (uint32_t)0xFFC0FFFF;

    /* Reset PREDIV1[3:0] bits */
    RCC->CFGR2 &= (uint32_t)0xFFFFFFF0;

    /* Reset USARTSW, I2CSW, CECSW, and ADCSW bits */
    RCC->CFGR3 &= (uint32_t)0xFFFFFEAC;

    /* Reset HSI14 bit */
    RCC->CR2 &= (uint32_t)0xFFFFFFFE;

    /* Disable all interrupts */
    RCC->CIR = 0x00000000;
}

/**
 * @brief  AHB prescaler table
 */
const uint8_t AHBPrescTable[16] = {0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 6, 7, 8, 9};
