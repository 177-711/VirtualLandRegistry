export const idlFactory = ({ IDL }) => {
  const LandRegistryError = IDL.Variant({
    'InvalidCoordinates' : IDL.Null,
    'OwnershipError' : IDL.Null,
    'InvalidInput' : IDL.Null,
    'LandNotForSale' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'LandNotFound' : IDL.Null,
    'InvalidDimensions' : IDL.Null,
    'InsufficientFunds' : IDL.Null,
    'LandAlreadyExists' : IDL.Null,
  });
  const LandRegistryResult_1 = IDL.Variant({
    'Ok' : IDL.Null,
    'Err' : LandRegistryError,
  });
  const LandMetadata = IDL.Record({
    'utilities' : IDL.Vec(IDL.Text),
    'access_roads' : IDL.Vec(IDL.Text),
    'environment' : IDL.Opt(IDL.Text),
    'special_features' : IDL.Vec(IDL.Text),
  });
  const LandType = IDL.Variant({
    'Agricultural' : IDL.Null,
    'Commercial' : IDL.Null,
    'Entertainment' : IDL.Null,
    'Mixed' : IDL.Null,
    'Residential' : IDL.Null,
    'Industrial' : IDL.Null,
  });
  const Dimensions = IDL.Record({
    'height' : IDL.Nat32,
    'width' : IDL.Nat32,
    'depth' : IDL.Nat32,
  });
  const Coordinates = IDL.Record({
    'x' : IDL.Int32,
    'y' : IDL.Int32,
    'z' : IDL.Int32,
  });
  const LandInfo = IDL.Record({
    'id' : IDL.Nat64,
    'owner' : IDL.Principal,
    'metadata' : IDL.Opt(LandMetadata),
    'description' : IDL.Text,
    'last_updated' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'land_type' : LandType,
    'dimensions' : Dimensions,
    'coordinates' : Coordinates,
  });
  const LandStatistics = IDL.Record({
    'lands_for_sale' : IDL.Nat64,
    'average_price' : IDL.Opt(IDL.Nat64),
    'total_owners' : IDL.Nat64,
    'total_transactions' : IDL.Nat64,
    'total_lands' : IDL.Nat64,
  });
  const MarketplaceListing = IDL.Record({
    'seller' : IDL.Principal,
    'land_info' : LandInfo,
    'price' : IDL.Nat64,
    'land_id' : IDL.Nat64,
    'listed_at' : IDL.Nat64,
  });
  const TransactionType = IDL.Variant({
    'Registration' : IDL.Null,
    'Sale' : IDL.Null,
    'Transfer' : IDL.Null,
  });
  const TransactionRecord = IDL.Record({
    'to' : IDL.Principal,
    'transaction_type' : TransactionType,
    'from' : IDL.Principal,
    'timestamp' : IDL.Nat64,
    'price' : IDL.Opt(IDL.Nat64),
    'land_id' : IDL.Nat64,
  });
  const LandRegistration = IDL.Record({
    'metadata' : IDL.Opt(LandMetadata),
    'description' : IDL.Text,
    'land_type' : LandType,
    'dimensions' : Dimensions,
    'coordinates' : Coordinates,
  });
  const LandRegistryResult = IDL.Variant({
    'Ok' : IDL.Nat64,
    'Err' : LandRegistryError,
  });
  const SearchFilters = IDL.Record({
    'features' : IDL.Opt(IDL.Vec(IDL.Text)),
    'min_area' : IDL.Opt(IDL.Nat32),
    'coordinates_range' : IDL.Opt(IDL.Tuple(Coordinates, Coordinates)),
    'land_type' : IDL.Opt(LandType),
    'max_price' : IDL.Opt(IDL.Nat64),
    'min_price' : IDL.Opt(IDL.Nat64),
  });
  return IDL.Service({
    'add_admin' : IDL.Func([IDL.Principal], [LandRegistryResult_1], []),
    'backup_lands' : IDL.Func([], [IDL.Vec(LandInfo)], ['query']),
    'buy_land' : IDL.Func([IDL.Nat64], [LandRegistryResult_1], []),
    'get_all_lands' : IDL.Func([], [IDL.Vec(LandInfo)], ['query']),
    'get_land' : IDL.Func([IDL.Nat64], [IDL.Opt(LandInfo)], ['query']),
    'get_land_owner' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'get_land_statistics' : IDL.Func([], [LandStatistics], ['query']),
    'get_lands_by_owner' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(LandInfo)],
        ['query'],
      ),
    'get_lands_for_sale_by_type' : IDL.Func(
        [LandType],
        [IDL.Vec(MarketplaceListing)],
        ['query'],
      ),
    'get_lands_near_coordinates' : IDL.Func(
        [Coordinates, IDL.Nat32],
        [IDL.Vec(LandInfo)],
        ['query'],
      ),
    'get_marketplace_listing' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(MarketplaceListing)],
        ['query'],
      ),
    'get_marketplace_listings' : IDL.Func(
        [],
        [IDL.Vec(MarketplaceListing)],
        ['query'],
      ),
    'get_next_land_id' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_price_history' : IDL.Func(
        [IDL.Nat64],
        [IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64))],
        ['query'],
      ),
    'get_total_supply' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_transaction_history' : IDL.Func(
        [IDL.Opt(IDL.Nat64)],
        [IDL.Vec(TransactionRecord)],
        ['query'],
      ),
    'get_user_transactions' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(TransactionRecord)],
        ['query'],
      ),
    'is_admin' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'list_for_sale' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [LandRegistryResult_1],
        [],
      ),
    'register_land' : IDL.Func([LandRegistration], [LandRegistryResult], []),
    'remove_from_sale' : IDL.Func([IDL.Nat64], [LandRegistryResult_1], []),
    'remove_land' : IDL.Func([IDL.Nat64], [LandRegistryResult_1], []),
    'restore_lands' : IDL.Func([IDL.Vec(LandInfo)], [LandRegistryResult_1], []),
    'search_by_coordinates' : IDL.Func(
        [Coordinates, Coordinates],
        [IDL.Vec(LandInfo)],
        ['query'],
      ),
    'search_lands' : IDL.Func([SearchFilters], [IDL.Vec(LandInfo)], ['query']),
    'search_marketplace' : IDL.Func(
        [SearchFilters],
        [IDL.Vec(MarketplaceListing)],
        ['query'],
      ),
    'transfer_land' : IDL.Func(
        [IDL.Nat64, IDL.Principal],
        [LandRegistryResult_1],
        [],
      ),
    'update_land_metadata' : IDL.Func(
        [IDL.Nat64, LandMetadata],
        [LandRegistryResult_1],
        [],
      ),
    'verify_land_ownership' : IDL.Func(
        [IDL.Nat64, IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
