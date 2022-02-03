#!/bin/bash
## declare an array variable

declare -a arr=(
  "../unifyre-app-staking/frontend/node_modules/unifyre-extension-web3-retrofit/"
)

yarn build

## now loop through the above array
for path in "${arr[@]}"
do
  echo "copy to $path"
  cp -rf './dist' $path
done

