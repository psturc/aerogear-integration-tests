pipeline {
  agent none
  environment {
    BROWSERSTACK_USER = credentials('browserstack-user')
    BROWSERSTACK_KEY = credentials('browserstack-key')
    FIREBASE_SERVER_KEY = credentials('firebase-server-key')
    FIREBASE_SENDER_ID = credentials('firebase-sender-id')
  }
  stages {
    stage('Build Testing App') {
      parallel {

        stage('Android') {
          agent { 
            docker {
              image 'circleci/android:api-28-node'
              label 'psi_rhel8'
              args '-u root'
            }
          }
          environment {
            GOOGLE_SERVICES = credentials('google-services')
          }
          steps {
            sh 'apt install gradle'
            sh 'npm -g install cordova@8'
            git branch: 'master', url: 'https://github.com/aerogear/aerogear-integration-tests.git'
            sh 'cp ${GOOGLE_SERVICES} ./fixtures/google-services.json'
            sh './scripts/build-testing-app.sh'
            sh 'cat ./testing-app/bs-app-url.txt'
            stash includes: 'testing-app/bs-app-url.txt', name: 'android-testing-app'
          }
        }

        // stage('Build iOS') {
        //   agent { label 'osx5x' }
        //   environment { 
        //     MOBILE_PLATFORM = 'ios'
        //     DEVELOPMENT_TEAM = 'GHPBX39444'
        //     KEYCHAIN_PASS = '5sdfDSO8ig'
        //   }
        //   steps {
        //     sh 'npm -g install cordova@8'
        //     git branch: 'master', url: 'https://github.com/aerogear/aerogear-integration-tests.git'
        //     sh 'security unlock-keychain -p $KEYCHAIN_PASS && ./scripts/build-testing-app.sh'
        //     sh 'cat ./testing-app/bs-app-url.txt'
        //     stash includes: 'testing-app/bs-app-url.txt', name: 'ios-testing-app'        
        //   }
        // }
      }
    }

    stage('Run tests') {
      agent {
        label 'psi_rhel8'
        // docker {
        //   image 'circleci/node:dubnium-stretch'
        //   label 'psi_rhel8'
        //   args '-u root'
        // }
      }
      stages {
        stage('start services') {
          steps {
            sh 'docker network create aerogear || true'
            sh 'sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose'
            sh 'sudo chmod +x /usr/local/bin/docker-compose'
            sh 'docker-compose up -d'
          }
        }
        stage('test android') {
          steps {
            withDockerContainer(image: 'circleci/node:dubnium-stretch', args: '-u root --network aerogear') {
              sh 'ls -la'
              git branch: 'master', url: 'https://github.com/aerogear/aerogear-integration-tests.git'
              sh 'ls -la'
              //unstash 'android-testing-app'
              sh 'ls -la'
              sh 'ls -la testing-app'
              sh 'npm install'
              sh 'npm install mocha-jenkins-reporter'
              sh 'npm start -- test/metrics/*.js'
            }
          }
        }
      }
      post { 
        always {
          sh "docker rm -f \$(docker ps --all -q)"
        }
      }
    }
  }
}