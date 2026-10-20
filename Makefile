# River Raid — MRC. Todos os atalhos do projeto ficam aqui.
# Passos e requisitos: docs/README.md. Stack e pipelines nativos: docs/STACK.md.

ROM := River Raid (1982) (Activision) [!].a26
# JDK 25 compila o Android (o Capacitor exige Java 21+); o Gradle 8.14 não roda em JDK 26.
JAVA25 ?= $(shell /usr/libexec/java_home -v 25 2>/dev/null)
ANDROID_SDK := $(CURDIR)/tools/android-sdk
ENTRADAS_LISTAGEM := --entry 0xF000 --entry 0xF1F7 --entry 0xF1B4 --entry 0xF13A --entry 0xF152

.PHONY: help install dev test oracle listing build-web build-mac build-win build-android build-ios build-mobile clean

help:
	@echo "make install        instala as dependências (npm)"
	@echo "make dev            roda o modo desenvolvedor no navegador"
	@echo "make test           roda os testes do núcleo (LFSR, rio, regras do jogo)"
	@echo "make oracle         regenera os vetores do LFSR executando o ROM"
	@echo "make listing        regenera a desmontagem do ROM em docs/analise"
	@echo "make build-web      HTML5 em builds/web (um único index.html)"
	@echo "make build-mac      aplicativo macOS em builds/mac (só teclado)"
	@echo "make build-win      executável Windows em builds/win (compilação cruzada)"
	@echo "make build-android  APK de depuração em builds/android"
	@echo "make build-ios      app para o simulador iOS em builds/ios"
	@echo "make clean          remove builds e caches"

install:
	npm install

dev:
	npm run dev

test:
	npm test

oracle:
	python3 tools/rom/gerar_vetores_lfsr.py

listing:
	python3 tools/rom/disasm6502.py "$(ROM)" 0 $(ENTRADAS_LISTAGEM) > docs/analise/listagem-recursiva.asm
	python3 tools/rom/disasm6502.py "$(ROM)" 0 --linear > docs/analise/listagem-linear.asm

# Web: a plataforma é decidida em tempo de execução (toque ou não).
build-web:
	npm run build

# Mobile: HUD de toque sempre; gera builds/mobile para o Capacitor copiar.
build-mobile:
	npm run build:mobile

# Desktop: só teclado. O Tauri roda `npm run build:desktop` (builds/desktop), separado do web.
build-mac:
	npm run tauri -- build --bundles app
	rm -rf builds/mac && mkdir -p builds/mac
	cp -R "src-tauri/target/release/bundle/macos/River Raid.app" builds/mac/
	@echo "Aplicativo gerado em builds/mac/River Raid.app"

# Compilação cruzada a partir do Mac: cargo-xwin + LLVM (llvm-rc, clang-cl). Gera só o .exe.
LLVM_BIN ?= $(shell brew --prefix llvm 2>/dev/null)/bin
build-win:
	rustup target add x86_64-pc-windows-msvc
	PATH="$(LLVM_BIN):$$PATH" XWIN_ACCEPT_LICENSE=1 XWIN_CACHE_DIR="$(CURDIR)/tools/xwin-cache" \
		npx tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc --no-bundle
	rm -rf builds/win && mkdir -p builds/win
	cp src-tauri/target/x86_64-pc-windows-msvc/release/river-raid.exe builds/win/River-Raid.exe
	@echo "Executável gerado em builds/win/River-Raid.exe (não testado num Windows real)"

build-ios: build-mobile
	npx cap sync ios
	rm -rf builds/ios && mkdir -p builds/ios
	xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
		-sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
		CODE_SIGNING_ALLOWED=NO -derivedDataPath builds/.xcode \
		CONFIGURATION_BUILD_DIR="$(CURDIR)/builds/ios" build
	@echo "App do simulador em builds/ios/App.app"

build-android: build-mobile
	npx cap sync android
	# O AGP 8.13 não roda no Gradle 9.6+; o `cap sync` pode trocar o wrapper, então fixamos a versão aqui (9.5: compatível com o AGP 8.13 e com o JDK 25).
	sed -i '' 's#gradle-[0-9.]*-bin.zip#gradle-9.5.0-bin.zip#' android/gradle/wrapper/gradle-wrapper.properties
	printf "sdk.dir=%s\n" "$(ANDROID_SDK)" > android/local.properties
	cd android && JAVA_HOME="$(JAVA25)" ANDROID_HOME="$(ANDROID_SDK)" ./gradlew assembleDebug
	rm -rf builds/android && mkdir -p builds/android
	cp android/app/build/outputs/apk/debug/app-debug.apk builds/android/
	@echo "APK em builds/android/app-debug.apk"

clean:
	rm -rf builds/web builds/desktop builds/mobile builds/mac builds/win builds/android builds/ios builds/.xcode dist .vite src-tauri/target android/app/build
