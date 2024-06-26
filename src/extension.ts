import * as vscode from "vscode";
import * as xml2js from 'xml2js';

class HTMLDocumentFormatter implements vscode.DocumentFormattingEditProvider {
  public async provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions): Promise<vscode.TextEdit[]> {
    const parser = new xml2js.Parser();
    const builder = new xml2js.Builder({ headless: true, renderOpts: { pretty: true, indent: options.insertSpaces ? ' '.repeat(options.tabSize) : '\t', newline: '\r\n' } });

    return parser.parseStringPromise(document.getText())
      .then(json => {
        // Manipulate JSON object as needed
        // Example: Sorting elements by a specific attribute
        // Assuming json structure is correct and has elements array

        // Convert JSON back to XML
        if (json.root.data.length > 1) {
          json.root.data.sort((a: any, b: any) => {
            const aKey = a['$']['name'];
            const bKey = b['$']['name'];

            return aKey.localeCompare(bKey);
          });
        }

        var x = json;



        const xml = builder.buildObject(json);

        // Create a range covering the entire document
        const range = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));

        // Return the formatted XML as a TextEdit operation
        return [new vscode.TextEdit(range, xml)];
      })
      .catch(error => {
        console.error('Failed to parse XML:', error);
        vscode.window.showErrorMessage('Failed to parse XML: ' + error.message);
        return [];
      });
  }
}

export function activate(context: vscode.ExtensionContext) {
  const formatter = new HTMLDocumentFormatter();

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      { language: "xml", scheme: "file", pattern: "**/*.resx" },
      formatter
    )
  );
}

export function deactivate() { }