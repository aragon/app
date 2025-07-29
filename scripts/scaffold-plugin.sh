#!/usr/bin/env bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 Aragon Plugin Scaffolder${NC}\n"

##########################################
## 1. Read Plugin Name & Confirm Validity
##########################################

# (Prompts for plugin name in camelCase, validates, and confirms)
while true; do
  read -p "Plugin name (camelCase, e.g., lockToVote): " PLUGIN_NAME

  if [[ ! $PLUGIN_NAME =~ ^[a-z][a-zA-Z0-9]*$ ]]; then
      echo -e "${RED}❌ Invalid plugin name format. Use camelCase starting with lowercase.${NC}"
      continue
  fi

  echo -e "${YELLOW}⚠️  You entered: ${PLUGIN_NAME}${NC}"
  read -p "Is this correct? [Y/n]: " confirm
    confirm=${confirm:-y} # default to 'y' if empty
    case "$confirm" in
      [yY][eE][sS]|[yY])
        break
        ;;
      *)
        echo "Let's try again..."
        ;;
    esac
done

if [[ ! $PLUGIN_NAME =~ ^[a-z][a-zA-Z0-9]*$ ]]; then
    echo -e "${RED}❌ Invalid plugin name format. Use camelCase starting with lowercase.${NC}"
    exit 1
fi

PLUGIN_DIR="src/plugins/${PLUGIN_NAME}Plugin"
if [ -d "$PLUGIN_DIR" ]; then
    echo -e "${RED}❌ Plugin directory already exists: $PLUGIN_DIR${NC}"
    exit 1
fi

##########################################
## 2. Define Name Transformations Helpers
##########################################

to_pascal_case() {
  echo "$1" | awk '{print toupper(substr($0,1,1)) substr($0,2)}'
}
to_snake_case() {
  echo "$1" | sed 's/\([a-z]\)\([A-Z]\)/\1_\2/g' | tr '[:lower:]' '[:upper:]'
}
to_kebab_case() {
  echo "$1" | sed 's/\([a-z]\)\([A-Z]\)/\1-\2/g' | tr '[:upper:]' '[:lower:]'
}
to_title_case() {
  echo "$1" |
    sed -E 's/([a-z0-9])([A-Z])/\1 \2/g' |
    awk '{for (i=1; i<=NF; ++i) $i=toupper(substr($i,1,1)) tolower(substr($i,2))} 1'
}

PASCAL_NAME="$(to_pascal_case "$PLUGIN_NAME")"
SNAKE_NAME="$(to_snake_case "$PLUGIN_NAME")"
KEBAB_NAME="$(to_kebab_case "$PLUGIN_NAME")"
DISPLAY_NAME="$(to_title_case "$PLUGIN_NAME")"

echo -e "${BLUE}🏗️ Creating plugin: ${PLUGIN_NAME}Plugin${NC}"

##########################################
## 3. Scaffold Plugin Directory & Stub Files
##########################################

mkdir -p "$PLUGIN_DIR"/{components,constants,hooks,utils,types,dialogs}

# components/index.ts
cat > "$PLUGIN_DIR/components/index.ts" <<EOF
// TODO: Export your components here
// export { ${PASCAL_NAME}Component } from './${PLUGIN_NAME}Component';
EOF

# hooks/index.ts
cat > "$PLUGIN_DIR/hooks/index.ts" <<EOF
// TODO: Export your hooks here
// export { use${PASCAL_NAME}Hook } from './use${PASCAL_NAME}Hook';
EOF

# utils/index.ts
cat > "$PLUGIN_DIR/utils/index.ts" <<EOF
// TODO: Export your utilities here
// export { ${PLUGIN_NAME}Utils } from './${PLUGIN_NAME}Utils';
EOF

# types/index.ts
cat > "$PLUGIN_DIR/types/index.ts" <<EOF
// TODO: Export your types here
// export interface I${PASCAL_NAME}Data {}
EOF

# dialogs/index.ts
cat > "$PLUGIN_DIR/dialogs/index.ts" <<EOF
// TODO: Export your dialogs here
// export { ${PASCAL_NAME}Dialog } from './${PLUGIN_NAME}Dialog';
EOF

# plugin index.ts
cat > "$PLUGIN_DIR/index.ts" <<EOF
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ${PLUGIN_NAME}Plugin } from './constants/${PLUGIN_NAME}Plugin';

export const initialise${PASCAL_NAME}Plugin = () => {
    pluginRegistryUtils.registerPlugin(${PLUGIN_NAME}Plugin);
};
EOF

# {PLUGIN_NAME}/constants/pluginDialogId.ts
# (Creates file with TODO enum block for dialog IDs)
dialog_id_file="$PLUGIN_DIR/constants/${PLUGIN_NAME}PluginDialogId.ts"
cat > "$dialog_id_file" <<EOF
// TODO: Define dialog IDs
// export enum ${PASCAL_NAME}PluginDialogId {
//     EXAMPLE_TRANSACTION = 'EXAMPLE_TRANSACTION',
// }
EOF

# {PLUGIN_NAME}/constants/pluginDialogsDefinitions.ts
# (Creates file with TODO record for dialog components)
dialogs_def_file="$PLUGIN_DIR/constants/${PLUGIN_NAME}PluginDialogsDefinitions.ts"
cat > "$dialogs_def_file" <<EOF
// TODO: Define dialog components
// import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
// import { ${PASCAL_NAME}ExampleDialog } from '../dialogs/${PLUGIN_NAME}ExampleDialog';
// import { ${PASCAL_NAME}ExampleTransactionDialog } from '../dialogs/${PLUGIN_NAME}ExampleTransactionDialog';
// import { ${PASCAL_NAME}PluginDialogId } from './${PLUGIN_NAME}PluginDialogId';

// export const ${PLUGIN_NAME}PluginDialogsDefinitions: Record<
//     ${PASCAL_NAME}PluginDialogId,
//     IDialogComponentDefinitions
// > = {
//     [${PASCAL_NAME}PluginDialogId.EXAMPLE_TRANSACTION]: {
//         Component: ${PASCAL_NAME}ExampleTransactionDialog,
//     },
// };
EOF

# {PLUGIN_NAME}/constants/${PLUGIN_NAME}Plugin.ts
# (Creates plugin constant file with networks populated dynamically)
enum_file="src/shared/api/daoService/domain/enum/network.ts"
const_file="$PLUGIN_DIR/constants/${PLUGIN_NAME}Plugin.ts"

cat > "$const_file" <<EOF
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export const ${PLUGIN_NAME}Plugin: IPluginInfo = {
    id: PluginInterfaceType.${SNAKE_NAME},
    subdomain: '${KEBAB_NAME}',
    name: '${DISPLAY_NAME}',
    installVersion: { release: 1, build: 1, releaseNotes: '', description: '' },
    repositoryAddresses: {
EOF

grep -E '^\s*[A-Z0-9_]+' "$enum_file" \
  | sed -E 's/=.*//' \
  | tr -d ' ' \
  | while read -r net; do
    printf "      [Network.%s]: '0x0000000000000000000000000000000000000000',\n" "$net" >> "$const_file"
done

cat >> "$const_file" <<EOF
    },
};
EOF

echo -e "\n${GREEN}✅ Plugin scaffolding complete!${NC}"

##########################################
## 4. Generate Plugin Registry File
##########################################

echo -e "\n${BLUE}🔧 Generating src/plugins/index.ts…${NC}"
{
  for DIR in $(ls -1d src/plugins/*Plugin | sort); do
    base=$(basename "$DIR")
    NAME="${base%Plugin}"
    PASCAL="$(to_pascal_case "$NAME")"
    echo "import { initialise${PASCAL}Plugin } from './${NAME}Plugin';"
    echo "import { ${NAME}PluginDialogsDefinitions } from './${NAME}Plugin/constants/${NAME}PluginDialogsDefinitions';"
  done

  echo
  echo "export const initialisePlugins = () => {"
  for DIR in $(ls -1d src/plugins/*Plugin | sort); do
    base=$(basename "$DIR")
    NAME="${base%Plugin}"
    PASCAL="$(to_pascal_case "$NAME")"
    echo "    initialise${PASCAL}Plugin();"
  done
  echo "};"
  echo
  echo "export const pluginDialogsDefinitions = {"
  for DIR in $(ls -1d src/plugins/*Plugin | sort); do
    base=$(basename "$DIR")
    NAME="${base%Plugin}"
    if [ "$NAME" = "$PLUGIN_NAME" ]; then
      echo "    // ...${NAME}PluginDialogsDefinitions,"
    else
      echo "    ...${NAME}PluginDialogsDefinitions,"
    fi
  done
  echo "};"
} > src/plugins/index.ts

##########################################
## 5. Inject PluginInterfaceType Enum Entry
##########################################

PLUGIN_ENUM_PATH="src/shared/api/daoService/domain/enum/pluginInterfaceType.ts"

# Check if enum already contains the value
if grep -q "^\s*${SNAKE_NAME} = '${PLUGIN_NAME}'," "$PLUGIN_ENUM_PATH"; then
  echo -e "${YELLOW}⚠️  PluginInterfaceType already contains: ${SNAKE_NAME}${NC}"
else
  # Insert before UNKNOWN line
  awk -v key="$SNAKE_NAME" -v val="$PLUGIN_NAME" '
    /UNKNOWN *= *'\''unknown'\''/ {
      print "    " key " = \x27" val "\x27,";
    }
    { print }
  ' "$PLUGIN_ENUM_PATH" > "${PLUGIN_ENUM_PATH}.tmp" && mv "${PLUGIN_ENUM_PATH}.tmp" "$PLUGIN_ENUM_PATH"

  echo -e "${GREEN}✅ Added ${SNAKE_NAME} to PluginInterfaceType enum.${NC}"
fi

##########################################
## 6. Run Prettier Formatting
##########################################

echo -e "\n${BLUE}✨ Running Prettier on all new plugin files…${NC}"
npx prettier --write "src/plugins/${PLUGIN_NAME}Plugin/**/*.{ts,tsx,js,jsx,json,css,md}" src/plugins/index.ts

echo -e "\n${GREEN}🎉 Done! ${PLUGIN_NAME}Plugin has been scaffolded.${NC}"
