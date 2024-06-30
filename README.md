A plugin for the Serverless framework to create a version alias
for the Lambda function which is named after the current git
SHA.

This makes it easier to deduce the version that is running.

> [!NOTE]
> This plugin has only been tested with the AWS provider and will
> not work if you are deploying to other providers e.g. GCP.

## Installation

Install using NPM by using the following command

```sh
npm install --save-dev serverless-shortsha-plugin
```

And then add the plugin to your `serverless.yml` file:

```yaml
plugins:
  - serverless-shortsha-plugin
```

A thorough guide on installing plugins can be found at
https://www.serverless.com/framework/docs-guides-plugins

## Usage

There isn't anything specific to be done once the plugin is installed.
When you trigger a deployment, the plugin will take the short SHA
of the current directory (assuming that the project is in fact a
a Git repository).

```
$ sls deploy

Deploying test-logcls to stage dev (us-east-1)
Compiling with Typescript...
Using local tsconfig.json - tsconfig.json
Typescript compiled.

Warning: Package patterns at function level are only applicable if package.individually is set to true at service level or function level in serverless.yaml. The framework will ignore the patterns defined at the function level and apply only the service-wide ones.
Warning: cloudformation scan results:

Alias "40d313f" added for function "ProbotLambdaFunction" in the CloudFormation template

✔ Service deployed to stack test-logcls-dev (104s)

endpoint: https://sfukfimmof3tinylzdbum77uvdu0xtznt.lambda-url.us-east-1.on.aws/
functions:
  probot: test-logcls-dev-probot (22 MB)

Need a faster logging experience than CloudWatch? Try our Dev Mode in Console: run "serverless dev"
```

## Contributing

If you have suggestions for how this app could be improved, or
want to report a bug, open an issue - we'd love all and any
contributions.

## License

Apache License 2.0 © 2024 Mridang Agarwalla
