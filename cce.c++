#include <iostream>
#include <fstream>
#include <string>

using namespace std;

int main() {
    string filename = "example.txt";
    ofstream outFile(filename);
    if (!outFile) {
        cout << "Error creating file!" << endl;
        return 1;
    }
    cout << "File created successfully." << endl;
    outFile << "Hello, this is a sample text.\n";
    outFile << "This is written into the file." << endl;
    outFile.close();
    ifstream inFile(filename);
    if (!inFile) {
        cout << "Error opening file for reading!" << endl;
        return 1;
    }
    cout << "Reading from file:" << endl;
    string line;
    while (getline(inFile, line)) {
        cout << line << endl;
    }
    inFile.close();
    return 0;
}
