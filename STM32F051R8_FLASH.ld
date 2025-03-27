/*
 * STM32F051R8_FLASH.ld
 * Linker script for STM32F051R8 microcontroller
 * Flash: 64KB, RAM: 8KB
 */

/* Entry Point */
ENTRY(Reset_Handler)

/* Highest address of the user mode stack */
_estack = 0x20002000;    /* end of RAM */

/* Memory areas definition */
MEMORY
{
  FLASH (rx)      : ORIGIN = 0x08000000, LENGTH = 64K
  RAM (xrw)       : ORIGIN = 0x20000000, LENGTH = 8K
}

/* Sections definition */
SECTIONS
{
  /* The program code and other data into FLASH */
  .text :
  {
    . = ALIGN(4);
    *(.isr_vector)       /* Startup code */
    *(.text)             /* .text sections (code) */
    *(.text*)            /* .text* sections (code) */
    *(.rodata)           /* .rodata sections (constants, strings, etc.) */
    *(.rodata*)          /* .rodata* sections (constants, strings, etc.) */
    . = ALIGN(4);
    _etext = .;          /* define a global symbol at end of code */
  } >FLASH

  /* Used by the startup to initialize data */
  _sidata = LOADADDR(.data);

  /* Initialized data sections into RAM */
  .data : 
  {
    . = ALIGN(4);
    _sdata = .;          /* create a global symbol at data start */
    *(.data)             /* .data sections */
    *(.data*)            /* .data* sections */
    . = ALIGN(4);
    _edata = .;          /* define a global symbol at data end */
  } >RAM AT> FLASH

  /* Uninitialized data section into RAM */
  .bss :
  {
    . = ALIGN(4);
    _sbss = .;           /* define a global symbol at bss start */
    *(.bss)              /* .bss sections */
    *(.bss*)             /* .bss* sections */
    *(COMMON)            /* Common symbols */
    . = ALIGN(4);
    _ebss = .;           /* define a global symbol at bss end */
  } >RAM

  /* User_heap_stack section, used to check that there is enough 
   * RAM left for the user stack and heap
   */
  ._user_heap_stack :
  {
    . = ALIGN(4);
    . = . + 0x200;       /* 0x200 bytes of stack memory */
    . = . + 0x200;       /* 0x200 bytes of heap memory */
    . = ALIGN(4);
  } >RAM

  /* Remove information from the standard libraries */
  /DISCARD/ :
  {
    libc.a ( * )
    libm.a ( * )
    libgcc.a ( * )
  }
}
