#!/bin/bash

# prepare folder
CI_ARTIFACTS_DIR=${CIRCLE_ARTIFACTS:-./.local_ci_artifacts}
mkdir -p $CI_ARTIFACTS_DIR/style

# variables
GIT_FILE=$CI_ARTIFACTS_DIR/style/gitstyle.txt

# checks
echo "checking git style..."
./bin/check_git_style.sh > $GIT_FILE
echo "git style check complete!"

echo "linting source"
npm run lint

# verify

if [ -s "$GIT_FILE" ];
then
    echo "Found Git Errors"
    cat $GIT_FILE
    exit 1
else
    :
fi

exit 0
