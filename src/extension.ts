// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as vsls from 'vsls';

let collaborateInTeamsStatusBarItem: vscode.StatusBarItem;

function getLabel(sessionId: string | null) : string {
	if (sessionId === null) {
		return 'Collaborate in Teams';
	} else {
		return '$(live-share) Share session in Teams';
	}
}

function generateUrl(sessionId: string) : vscode.Uri {

	console.log(encodeURIComponent(`https://vscode.dev/liveshare/${sessionId}`));

	const appContext = {
		"appSharingUrl": `https://vscode.dev/liveshare/${sessionId}`,
		"appId": "9cc80a93-1d41-4bcb-8170-4b9ec9e29fbb"
	};


	console.log(encodeURIComponent(JSON.stringify(appContext)));

	//const appContext = encodeURI(`{ "appSharingUrl" : "https://vscode.dev/liveshare/${sessionId}", "appId": "9cc80a93-1d41-4bcb-8170-4b9ec9e29fbb"}`);

	const url = `msteams:l/meeting-share?deeplinkId=ACCC6AFE-449D-4AF3-8D3E-E8A7B3AB1280&fqdn=&lm=deeplink&appContext=${encodeURIComponent(JSON.stringify(appContext))}`;

	console.log(url);

	return vscode.Uri.parse(url);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function  activate({subscriptions}: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "msteams-liveshare-integration" is now active!');

	const commandId = 'msteams-liveshare-integration.collaborateInTeams';

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(commandId, async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		console.log('Collaborate in Teams command called!');

		const liveshare = await vsls.getApi();

		if (liveshare !== null) {

			if (liveshare.session.id === null) {
				await liveshare.share({suppressNotification: true});

				if (liveshare.session.id !== null) {
					vscode.env.openExternal(generateUrl(liveshare.session.id));
				} else {
					vscode.window.showErrorMessage('Failed to start Live Share session');
				}
			} else {
				vscode.env.openExternal(generateUrl(liveshare.session.id));
			}
		}
	});

	subscriptions.push(disposable);

	vsls.getApi().then( (liveshare) => {

		if (liveshare === null) {
			vscode.window.showErrorMessage('Live Share is not available');
		} else {
			collaborateInTeamsStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
			collaborateInTeamsStatusBarItem.command = commandId;
			collaborateInTeamsStatusBarItem.text = getLabel(liveshare?.session.id ?? null);
			collaborateInTeamsStatusBarItem.show();
		
			liveshare?.onDidChangeSession( (event) => {
				collaborateInTeamsStatusBarItem.text = getLabel(event.session.id);
			});	

			subscriptions.push(collaborateInTeamsStatusBarItem);
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
