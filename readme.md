# vue-slint
[![Build Status](https://travis-ci.org/valantonini/vue-slint.svg?branch=master)](https://travis-ci.org/valantonini/vue-slint)
[![npm version](https://badge.fury.io/js/vue-slint.svg)](https://badge.fury.io/js/vue-slint)
![npm](https://img.shields.io/npm/dt/vue-slint.svg?style=plastic)

A tool to lint a VueCLI project and send the results to slack tagging the last committer.

![sample](https://raw.githubusercontent.com/valantonini/vue-slint/master/sample/sample.png)

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
