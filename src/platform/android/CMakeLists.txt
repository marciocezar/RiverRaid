cmake_minimum_required(VERSION 3.16)
project(riverlab C)

# Biblioteca estática do núcleo. O app Android (NDK) liga isto e copia
# o quadro de river_present para um Bitmap. Não há regra de jogo no Kotlin.
add_library(riverlab STATIC
    ${CMAKE_CURRENT_SOURCE_DIR}/../../core/river.c
    ${CMAKE_CURRENT_SOURCE_DIR}/../../systems/present.c
    ${CMAKE_CURRENT_SOURCE_DIR}/../../systems/audio.c
)
target_include_directories(riverlab PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/../../core
    ${CMAKE_CURRENT_SOURCE_DIR}/../../systems
    ${CMAKE_CURRENT_SOURCE_DIR}/../../entities
)
target_compile_features(riverlab PUBLIC c_std_11)
