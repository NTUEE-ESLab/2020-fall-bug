#!/bin/sh

mbed-tools compile -t "${TOOLCHAIN:-GCC_ARM}" -m "${MBED_TARGET:-DISCO_L475VG_IOT01A}" "$@"
