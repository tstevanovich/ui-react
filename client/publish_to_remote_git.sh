#!/bin/bash
# Publish script is very handy to publish local projects into remote git repository.

echo "The script commits your local changes to the git repository. Prior to running the script make sure to clone the repo created by the ELMA API/UI using the git clone command (git clone -s <repo-path>). Thereafter copy or unzip the contents of the template into that directory before running this script."

# Initializing the local git repository.
#git init

# Add all project files to local git repository.
git add .

# Commit the files into local git repository.
read -p "Enter the commit message: " commit_message
while [ -z "${commit_message// }" ]; do
  echo "Commit message cannot be empty"
  read -p "Enter the commit message: " commit_message
done

git commit -m "$commit_message"
echo "Local commit completed"

# Configuring the remote git repository.
#read -p "Enter the repo location: " repo_loc
#git remote add origin $repo_loc

#echo "Getting ready to push the project into remote Git repository."

#read -p "Are you sure you want to continue? <Y/N>: " prompt
#if [[ $prompt == "n" || $prompt == "N" || $prompt == "no" || $prompt == "No" ]]
#then
#  echo "Terminating check in process. Please commit file manually."
#  exit
#fi

echo "Pushing the project into remote Git repository."
# Commit the files into local git repository.
read -p "Enter your branch name: " branch_name
git checkout -b $branch_name
git push -u origin $branch_name

echo "Successfully Completed Remote Push!!!. Good Luck with your CI/CD pipeline"