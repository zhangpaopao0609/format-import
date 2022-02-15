# format-import
> Beta

[Plugin's page on Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=ardor-zhang.format-import)

This extension is used to check the import method of non best practices in the project, give error prompts and provide one click repair function (Under development)
> [Click to view the 'import' of best practices ]() (Under development)

## Usage
1. Install extension at vscode
Search **format import** and install in the marketplace.

2. Add import.json in the root directory of the project
Users can customize and configure some special fields for this extension via import.json. If there are no special configuration items, this file is not required.

Configuration reference
```
{
  "alias": {
    "@": "src"
  },
  "whiteDirName": ["effects"]
}
```

| field         | description                | type   | options |
| ------------ | ------------------- | ------ | ------ |
| alias        | path abbreviation            | object | -      |
| whiteDirName | directory whitelist during import | string |        |
|              |                     |        |        |

3. Get the path of all documents with 'import' problem
- press: Ctrl/Command+Shift+p
- input: format-import.checkAll

## Commands
| Command	         | description                |
| ------------ | ------------------- |
| format-import.checkAll        | check all 'problem'            |
| format-import.rules | displays the best practices document for import |