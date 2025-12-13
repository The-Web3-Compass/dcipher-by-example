// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import {RandomnessReceiverBase} from "randomness-solidity/src/RandomnessReceiverBase.sol";

contract RandomTraitsNFT is ERC721, RandomnessReceiverBase {
    using Strings for uint256;

    // ============ State Variables ============

    uint256 public nextTokenId;
    uint256 public maxSupply = 100;

    // Mapping: tokenId => randomness request ID
    mapping(uint256 => uint256) public tokenToRequestId;

    // Mapping: request ID => tokenId
    mapping(uint256 => uint256) public requestIdToToken;

    // Mapping: tokenId => random seed
    mapping(uint256 => bytes32) public tokenTraitSeed;

    // ============ Events ============

    event NFTMinted(uint256 indexed tokenId, address indexed minter, uint256 requestId);
    event TraitsRevealed(uint256 indexed tokenId, bytes32 randomSeed);

    // ============ Constructor ============

    constructor(
        address _randomnessSender,
        address _owner
    )
        ERC721("Random Shapes", "SHAPES")
        RandomnessReceiverBase(_randomnessSender, _owner)
    {}

    // ============ Minting ============

    function mint(uint32 callbackGasLimit) external payable returns (uint256) {
        require(nextTokenId < maxSupply, "Max supply reached");

        uint256 tokenId = nextTokenId;
        nextTokenId++;

        // Mint the NFT to the caller
        _safeMint(msg.sender, tokenId);

        // Request randomness from dcipher
        (uint256 requestId, ) = _requestRandomnessPayInNative(callbackGasLimit);

        // Store the mapping between token and request
        tokenToRequestId[tokenId] = requestId;
        requestIdToToken[requestId] = tokenId;

        emit NFTMinted(tokenId, msg.sender, requestId);

        return tokenId;
    }

    // ============ Randomness Callback ============

    function onRandomnessReceived(
        uint256 requestId,
        bytes32 randomness
    ) internal override {
        uint256 tokenId = requestIdToToken[requestId];

        require(tokenId < nextTokenId, "Invalid token ID");
        require(tokenTraitSeed[tokenId] == bytes32(0), "Traits already revealed");

        // Store the random seed for this token
        tokenTraitSeed[tokenId] = randomness;

        emit TraitsRevealed(tokenId, randomness);
    }

    // ============ Trait Derivation ============

    function getTraits(uint256 tokenId) public view returns (
        string memory shape,
        string memory color,
        string memory size
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        bytes32 seed = tokenTraitSeed[tokenId];

        if (seed == bytes32(0)) {
            return ("Revealing", "Revealing", "Revealing");
        }

        // Derive traits from random seed
        uint256 randomValue = uint256(seed);

        // Shape (5 options: 0-4)
        uint256 shapeIndex = randomValue % 5;
        string[5] memory shapes = ["Circle", "Square", "Triangle", "Pentagon", "Hexagon"];
        shape = shapes[shapeIndex];

        // Color (8 options: 0-7)
        uint256 colorIndex = (randomValue / 5) % 8;
        string[8] memory colors = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Cyan"];
        color = colors[colorIndex];

        // Size (4 options: 0-3)
        uint256 sizeIndex = (randomValue / 40) % 4;
        string[4] memory sizes = ["Small", "Medium", "Large", "Huge"];
        size = sizes[sizeIndex];
    }

    // ============ Metadata ============

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        (string memory shape, string memory color, string memory size) = getTraits(tokenId);

        // Generate SVG
        string memory svg = generateSVG(shape, color, size);

        // Build metadata JSON
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Random Shape #',
                        tokenId.toString(),
                        '", "description": "An NFT with traits determined by dcipher threshold randomness", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '", "attributes": [',
                        '{"trait_type": "Shape", "value": "', shape, '"},',
                        '{"trait_type": "Color", "value": "', color, '"},',
                        '{"trait_type": "Size", "value": "', size, '"',
                        '}]}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function generateSVG(
        string memory shape,
        string memory color,
        string memory size
    ) internal pure returns (string memory) {
        // Map color names to hex values
        string memory colorHex = getColorHex(color);

        // Map size to dimensions
        uint256 dimension = getSizeDimension(size);

        // Calculate center position
        uint256 cx = 150;
        uint256 cy = 150;

        string memory shapeElement;

        if (keccak256(bytes(shape)) == keccak256(bytes("Circle"))) {
            shapeElement = string(
                abi.encodePacked(
                    '<circle cx="', cx.toString(), '" cy="', cy.toString(),
                    '" r="', (dimension / 2).toString(), '" fill="', colorHex, '"/>'
                )
            );
        } else if (keccak256(bytes(shape)) == keccak256(bytes("Square"))) {
            uint256 x = cx - (dimension / 2);
            uint256 y = cy - (dimension / 2);
            shapeElement = string(
                abi.encodePacked(
                    '<rect x="', x.toString(), '" y="', y.toString(),
                    '" width="', dimension.toString(), '" height="', dimension.toString(),
                    '" fill="', colorHex, '"/>'
                )
            );
        } else if (keccak256(bytes(shape)) == keccak256(bytes("Triangle"))) {
            uint256 halfBase = dimension / 2;
            uint256 height = (dimension * 866) / 1000; // Approximate equilateral triangle height
            shapeElement = string(
                abi.encodePacked(
                    '<polygon points="', cx.toString(), ',', (cy - (height * 2 / 3)).toString(),
                    ' ', (cx - halfBase).toString(), ',', (cy + (height / 3)).toString(),
                    ' ', (cx + halfBase).toString(), ',', (cy + (height / 3)).toString(),
                    '" fill="', colorHex, '"/>'
                )
            );
        } else {
            // Default to Pentagon or Hexagon (simplified as circles for this example)
            shapeElement = string(
                abi.encodePacked(
                    '<circle cx="', cx.toString(), '" cy="', cy.toString(),
                    '" r="', (dimension / 2).toString(), '" fill="', colorHex, '"/>'
                )
            );
        }

        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">',
                '<rect width="300" height="300" fill="#f0f0f0"/>',
                shapeElement,
                '</svg>'
            )
        );
    }

    function getColorHex(string memory color) internal pure returns (string memory) {
        if (keccak256(bytes(color)) == keccak256(bytes("Red"))) return "#FF0000";
        if (keccak256(bytes(color)) == keccak256(bytes("Blue"))) return "#0000FF";
        if (keccak256(bytes(color)) == keccak256(bytes("Green"))) return "#00FF00";
        if (keccak256(bytes(color)) == keccak256(bytes("Yellow"))) return "#FFFF00";
        if (keccak256(bytes(color)) == keccak256(bytes("Purple"))) return "#800080";
        if (keccak256(bytes(color)) == keccak256(bytes("Orange"))) return "#FFA500";
        if (keccak256(bytes(color)) == keccak256(bytes("Pink"))) return "#FFC0CB";
        if (keccak256(bytes(color)) == keccak256(bytes("Cyan"))) return "#00FFFF";
        return "#CCCCCC"; // Default gray for "Revealing"
    }

    function getSizeDimension(string memory size) internal pure returns (uint256) {
        if (keccak256(bytes(size)) == keccak256(bytes("Small"))) return 40;
        if (keccak256(bytes(size)) == keccak256(bytes("Medium"))) return 70;
        if (keccak256(bytes(size)) == keccak256(bytes("Large"))) return 100;
        if (keccak256(bytes(size)) == keccak256(bytes("Huge"))) return 130;
        return 50; // Default for "Revealing"
    }
}