# vue-slint
[![Build Status](https://travis-ci.org/valantonini/vue-slint.svg?branch=master)](https://travis-ci.org/valantonini/vue-slint)

A tool to lint a VueCLI project and send the results to slack tagging the last committer.

![sample](./sample/sample.png)

## Requirements:

- vuecli (with eslint / tslint set up)
- npx
- git

## Dependencies:

```
npm install npx -g
```

## Install
```
npm install vue-slint -g
```

## Usage
You will need a slack api token e.g. 

```
xoxb-111111111111-222222222222-abcDef5H1jkLmno9qRSTuvWX
```

Create a lookup file that converts the git username to the slack id

```
{
    "val": "@val",
    "john smith": "@john"
}
```

Execute
```
vue-slint --token xoxb-111111111111-222222222222-abcDef5H1jkLmno9qRSTuvWX --channel my-slack-channel -folder ~/Source/MyVueCliProject -u ~/Source/MyVueCliProject/slackUsers.json
```
