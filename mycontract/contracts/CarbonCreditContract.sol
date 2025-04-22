// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CarbonCreditContract
 * @dev A contract for buying and selling carbon credits on the Scroll network
 */
contract CarbonCreditContract {
    address public owner;
    
    // Structure to store seller listing information
    struct SellerListing {
        uint256 id;
        address seller;
        string company;
        uint256 carbonTons;
        uint256 price; // in wei
        uint256 rate; // price per ton
        bool active;
        uint256 timestamp;
    }
    
    // Structure to store buyer listing information
    struct BuyerListing {
        uint256 id;
        address buyer;
        string company;
        uint256 carbonTons;
        uint256 price; // in wei
        uint256 rate; // price per ton
        bool active;
        uint256 timestamp;
    }
    
    // Counters for listings
    uint256 public sellerListingCount = 0;
    uint256 public buyerListingCount = 0;
    
    // Pool of carbon credits in the marketplace
    uint256 public carbonCreditPool = 0;
    
    // Mappings for listings
    mapping(uint256 => SellerListing) public sellerListings;
    mapping(uint256 => BuyerListing) public buyerListings;
    
    // Mapping to track addresses with their carbon credits
    mapping(address => uint256) public carbonCredits;
    
    // Events
    event SellerListingCreated(uint256 indexed id, address indexed seller, string company, uint256 carbonTons, uint256 price, uint256 rate);
    event BuyerListingCreated(uint256 indexed id, address indexed buyer, string company, uint256 carbonTons, uint256 price, uint256 rate);
    event CarbonCreditsPurchased(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 carbonTons, uint256 price);
    event CarbonCreditsSold(uint256 indexed listingId, address indexed seller, address indexed buyer, uint256 carbonTons, uint256 price);
    event ListingCancelled(uint256 indexed id, string listingType);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        // Initialize with some carbon credits in the pool for testing
        carbonCreditPool = 10053;
    }
    
    /**
     * @dev Create a new seller listing
     * @param company The company name
     * @param carbonTons The amount of carbon tons to sell
     * @param rate The price per ton in wei
     */
    function createSellerListing(string memory company, uint256 carbonTons, uint256 rate) external {
        require(carbonTons > 0, "Carbon tons must be greater than 0");
        require(rate > 0, "Rate must be greater than 0");
        
        // Check if the seller has enough carbon credits
        require(carbonCredits[msg.sender] >= carbonTons, "Insufficient carbon credits");
        
        // Increment the listing counter
        sellerListingCount++;
        
        // Calculate total price
        uint256 price = carbonTons * rate;
        
        // Create the listing
        sellerListings[sellerListingCount] = SellerListing({
            id: sellerListingCount,
            seller: msg.sender,
            company: company,
            carbonTons: carbonTons,
            price: price,
            rate: rate,
            active: true,
            timestamp: block.timestamp
        });
        
        // Emit event
        emit SellerListingCreated(sellerListingCount, msg.sender, company, carbonTons, price, rate);
    }
    
    /**
     * @dev Create a new buyer listing
     * @param company The company name
     * @param carbonTons The amount of carbon tons to buy
     * @param rate The price per ton in wei
     */
    function createBuyerListing(string memory company, uint256 carbonTons, uint256 rate) external payable {
        require(carbonTons > 0, "Carbon tons must be greater than 0");
        require(rate > 0, "Rate must be greater than 0");
        
        // Calculate total price
        uint256 price = carbonTons * rate;
        
        // Ensure the buyer has sent enough ETH
        require(msg.value >= price, "Insufficient payment");
        
        // Increment the listing counter
        buyerListingCount++;
        
        // Create the listing
        buyerListings[buyerListingCount] = BuyerListing({
            id: buyerListingCount,
            buyer: msg.sender,
            company: company,
            carbonTons: carbonTons,
            price: price,
            rate: rate,
            active: true,
            timestamp: block.timestamp
        });
        
        // Emit event
        emit BuyerListingCreated(buyerListingCount, msg.sender, company, carbonTons, price, rate);
    }
    
    /**
     * @dev Buy carbon credits from a seller listing
     * @param listingId The ID of the seller listing
     */
    function buyCarbonCredits(uint256 listingId) external payable {
        // Get the listing
        SellerListing storage listing = sellerListings[listingId];
        
        // Check if the listing exists and is active
        require(listing.active, "Listing is not active");
        require(listing.seller != address(0), "Listing does not exist");
        require(listing.seller != msg.sender, "Cannot buy your own listing");
        
        // Check if the buyer has sent enough ETH
        require(msg.value >= listing.price, "Insufficient payment");
        
        // Transfer carbon credits to the buyer
        carbonCredits[msg.sender] += listing.carbonTons;
        carbonCredits[listing.seller] -= listing.carbonTons;
        
        // Update the carbon credit pool
        carbonCreditPool -= listing.carbonTons;
        
        // Transfer payment to the seller
        payable(listing.seller).transfer(listing.price);
        
        // Mark the listing as inactive
        listing.active = false;
        
        // Emit event
        emit CarbonCreditsPurchased(listingId, msg.sender, listing.seller, listing.carbonTons, listing.price);
    }
    
    /**
     * @dev Sell carbon credits to a buyer listing
     * @param listingId The ID of the buyer listing
     */
    function sellCarbonCredits(uint256 listingId) external {
        // Get the listing
        BuyerListing storage listing = buyerListings[listingId];
        
        // Check if the listing exists and is active
        require(listing.active, "Listing is not active");
        require(listing.buyer != address(0), "Listing does not exist");
        require(listing.buyer != msg.sender, "Cannot sell to your own listing");
        
        // Check if the seller has enough carbon credits
        require(carbonCredits[msg.sender] >= listing.carbonTons, "Insufficient carbon credits");
        
        // Transfer carbon credits to the buyer
        carbonCredits[listing.buyer] += listing.carbonTons;
        carbonCredits[msg.sender] -= listing.carbonTons;
        
        // Update the carbon credit pool
        carbonCreditPool += listing.carbonTons;
        
        // Transfer payment to the seller
        payable(msg.sender).transfer(listing.price);
        
        // Mark the listing as inactive
        listing.active = false;
        
        // Emit event
        emit CarbonCreditsSold(listingId, msg.sender, listing.buyer, listing.carbonTons, listing.price);
    }
    
    /**
     * @dev Cancel a seller listing
     * @param listingId The ID of the seller listing
     */
    function cancelSellerListing(uint256 listingId) external {
        // Get the listing
        SellerListing storage listing = sellerListings[listingId];
        
        // Check if the listing exists and is active
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender, "Only the seller can cancel the listing");
        
        // Mark the listing as inactive
        listing.active = false;
        
        // Emit event
        emit ListingCancelled(listingId, "seller");
    }
    
    /**
     * @dev Cancel a buyer listing
     * @param listingId The ID of the buyer listing
     */
    function cancelBuyerListing(uint256 listingId) external {
        // Get the listing
        BuyerListing storage listing = buyerListings[listingId];
        
        // Check if the listing exists and is active
        require(listing.active, "Listing is not active");
        require(listing.buyer == msg.sender, "Only the buyer can cancel the listing");
        
        // Mark the listing as inactive
        listing.active = false;
        
        // Return the ETH to the buyer
        payable(listing.buyer).transfer(listing.price);
        
        // Emit event
        emit ListingCancelled(listingId, "buyer");
    }
    
    /**
     * @dev Mint carbon credits for testing/development purposes
     * @param to The address to mint credits to
     * @param amount The amount of carbon credits to mint
     */
    function mintCarbonCredits(address to, uint256 amount) external onlyOwner {
        carbonCredits[to] += amount;
        carbonCreditPool += amount;
    }
    
    /**
     * @dev Get the carbon credits balance of an address
     * @param account The address to check
     * @return The carbon credits balance
     */
    function getCarbonCreditsBalance(address account) external view returns (uint256) {
        return carbonCredits[account];
    }
    
    /**
     * @dev Get seller listing details
     * @param listingId The ID of the seller listing
     * @return id The listing ID
     * @return seller The seller address
     * @return company The company name
     * @return carbonTons The amount of carbon tons
     * @return price The total price
     * @return rate The price per ton
     * @return active Whether the listing is active
     */
    function getSellerListing(uint256 listingId) external view returns (
        uint256 id,
        address seller,
        string memory company,
        uint256 carbonTons,
        uint256 price,
        uint256 rate,
        bool active
    ) {
        SellerListing storage listing = sellerListings[listingId];
        return (
            listing.id,
            listing.seller,
            listing.company,
            listing.carbonTons,
            listing.price,
            listing.rate,
            listing.active
        );
    }
    
    /**
     * @dev Get buyer listing details
     * @param listingId The ID of the buyer listing
     * @return id The listing ID
     * @return buyer The buyer address
     * @return company The company name
     * @return carbonTons The amount of carbon tons
     * @return price The total price
     * @return rate The price per ton
     * @return active Whether the listing is active
     */
    function getBuyerListing(uint256 listingId) external view returns (
        uint256 id,
        address buyer,
        string memory company,
        uint256 carbonTons,
        uint256 price,
        uint256 rate,
        bool active
    ) {
        BuyerListing storage listing = buyerListings[listingId];
        return (
            listing.id,
            listing.buyer,
            listing.company,
            listing.carbonTons,
            listing.price,
            listing.rate,
            listing.active
        );
    }
    
    /**
     * @dev Get all active seller listings
     * @return Array of listing IDs
     */
    function getActiveSellerListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 1; i <= sellerListingCount; i++) {
            if (sellerListings[i].active) {
                activeCount++;
            }
        }
        
        // Create array to store active listing IDs
        uint256[] memory activeListings = new uint256[](activeCount);
        
        // Populate array
        uint256 index = 0;
        for (uint256 i = 1; i <= sellerListingCount; i++) {
            if (sellerListings[i].active) {
                activeListings[index] = i;
                index++;
            }
        }
        
        return activeListings;
    }
    
    /**
     * @dev Get all active buyer listings
     * @return Array of listing IDs
     */
    function getActiveBuyerListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 1; i <= buyerListingCount; i++) {
            if (buyerListings[i].active) {
                activeCount++;
            }
        }
        
        // Create array to store active listing IDs
        uint256[] memory activeListings = new uint256[](activeCount);
        
        // Populate array
        uint256 index = 0;
        for (uint256 i = 1; i <= buyerListingCount; i++) {
            if (buyerListings[i].active) {
                activeListings[index] = i;
                index++;
            }
        }
        
        return activeListings;
    }
} 