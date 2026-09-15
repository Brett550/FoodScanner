import * as cdk from 'aws-cdk-lib/core';
// import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // ============================================
    // S3 Bucket for photos
    // ============================================
    // const foodBucket = new s3.Bucket(this, 'FoodBucket', {
    //   bucketName: `personalProj-brettDionne-${this.account}`,
    //   removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev - delete bucket when stack is deleted
    //   autoDeleteObjects: true, // Delete objects when bucket is deleted
    // });


    // ============================================
    // Lambda Function
    // ============================================
    const nutritionHandler = new lambda.Function(this, 'NutritionHandler', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'index.lambda_handler',
      code: lambda.Code.fromAsset(path.resolve('../backend/food_classifier.py')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      // environment: {
      //   BUCKET_NAME: foodBucket.bucketName,
      // },
    });

    // Grant Lambda permissions
    // foodBucket.grantRead(nutritionHandler);
    
    // Bedrock permissions
    nutritionHandler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
      resources: [
        'arn:aws:bedrock:*::foundation-model/*anthropic.claude-sonnet-4-5-20250929-v1:0',
        'arn:aws:bedrock:*:*:inference-profile/*anthropic.claude-sonnet-4-5-20250929-v1:0',
      ],
    }));

    // ============================================
    // API Gateway
    // ============================================
    const api = new apigateway.RestApi(this, 'NutritionApi', {
      restApiName: 'Food Nutrition API',
      description: 'API for Brett\'s personal project',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type'],
      },
    });

    const nut = api.root.addResource('nut');
    nut.addMethod('GET', new apigateway.LambdaIntegration(nutritionHandler));

    // example resource
    // const queue = new sqs.Queue(this, 'InfraQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
