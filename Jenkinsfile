pipeline {
    agent any
    stages {
        // ===================================
        // 阶段 1: 打包后端应用
        // ===================================
        stage('Build & Package Backend') {
            steps {
                // 如果您的 Node.js 后端需要安装依赖，请取消注释下一行
                // sh 'npm install'

                // 核心：将整个项目打包成 backend-app.zip
                sh 'zip -r backend-app.zip .'
            }
        }

        // ===================================
        // 阶段 2: 部署到 Elastic Beanstalk
        // ===================================
        stage('Deploy to Elastic Beanstalk') {
            when {
                branch 'master' // 仅在 master 分支合并时触发
            }
            steps {
                withCredentials([
                    // 注入 AWS 凭证 (使用您 Jenkins 中配置的凭证 ID)
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    script {
                        // 动态版本号，确保每次部署的版本标签是唯一的
                        env.EB_VERSION = "build-${env.BUILD_NUMBER}"
                    }
                    
                    sh '''
                        # ⚠️ 必须替换这里的 S3 存储桶名 ⚠️
                        # 格式通常是：elasticbeanstalk-你的区域-你的AWS账号ID
                        # 假设您的 S3 存储桶名为: elasticbeanstalk-ap-southeast-2-123456789012 (请替换成您真实的桶名!)
                        S3_BUCKET="elasticbeanstalk-ap-southeast-2-506511511051" 
                        
                        echo "正在上传应用版本: ${EB_VERSION} 到 S3 存储桶: ${S3_BUCKET}..."
                        
                        # 1. 上传本地 ZIP 文件到 S3
                        # 文件将位于 S3 桶的根目录
                        aws s3 cp backend-app.zip s3://${S3_BUCKET}/${EB_VERSION}.zip
                        
                        # 2. 创建应用版本 (Application Version)
                        aws elasticbeanstalk create-application-version \
                            --application-name "Kobe" \
                            --version-label "${EB_VERSION}" \
                            --source-bundle S3Bucket="${S3_BUCKET}",S3Key="${EB_VERSION}.zip" \
                            --region "ap-southeast-2" \
                            --auto-create-application

                        echo "正在部署新版本到环境: Kobe-env..."

                        # 3. 更新环境，部署新版本 (自动替换旧版本)
                        aws elasticbeanstalk update-environment \
                            --environment-name "Kobe-env" \
                            --version-label "${EB_VERSION}" \
                            --region "ap-southeast-2"
                        
                        echo "Elastic Beanstalk 部署触发成功！"
                    '''
                }
            }
        }
    }
}
