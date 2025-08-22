import * as fs from 'fs'
import * as AWS from 'aws-sdk';
import { S3Client, GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(private readonly configService: ConfigService) {}
  private readonly config = {
    credentials: {
      accessKeyId: this.configService.get('aws.id'),
      secretAccessKey: this.configService.get('aws.secret'),
    },
    region: this.configService.get('aws.region')
  }

  async getSigned(file: string) {
    const s3Client = new S3Client(this.config);
    const command = new GetObjectCommand({
      Bucket: this.configService.get('aws.bucket'),
      Key: file,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn: 300 });
  }

  async checkFileExist(file: string) {
    try {
      const s3 = new S3(this.config);
      await s3.getObject({
        Bucket: this.configService.get('aws.bucket'),
        Key: file,
      })
    } catch (e) {
      return false
    }
    
    return true
  }

  async listObjectKey() {
    try {
      const s3 = new S3(this.config);
      const { Contents } = await s3.listObjects({ 
        Bucket: this.configService.get('aws.bucket') 
      })
      return Contents.map(e => e.Key)      
    } catch (e) {
      return []
    }
  }

  async uploadImage(name: string) {
    try {
      AWS.config.update({
        accessKeyId: this.configService.get('aws.id'),
        secretAccessKey: this.configService.get('aws.secret'),
        region: this.configService.get('aws.region')
      });
      const bucket = this.configService.get('aws.bucket')
      const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
      let fileStream = fs.createReadStream(`temps/${name}.png`);
      fileStream.on('error', function(err) {
        console.log('File Error', err);
      });
      s3.upload ({
        Bucket: bucket,
        Key: `${name}.png`,
        Body: fileStream
      }, function (err: any, data: any) {
        if (err) {
          console.log("Error: ", name);
        } if (data) {
          console.log("Upload Success", data.Location);
        }
      });
    } catch (e) {
      return false
    }
    
    return true
  }
}
